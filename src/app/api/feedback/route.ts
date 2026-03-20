import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import type { SignDetail, FeedbackRequest } from "@/lib/signs/types";
import { buildContext } from "@/lib/feedback/context-builder";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/feedback/prompt";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count++;
  return true;
}

function loadSignDetail(slug: string): SignDetail | null {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "sign-details",
      `${slug}.json`
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as SignDetail;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in an hour." },
      { status: 429 }
    );
  }

  // Parse request
  let body: FeedbackRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { signSlug, landmarks, duration, locale } = body;

  if (!signSlug || !landmarks || !Array.isArray(landmarks)) {
    return NextResponse.json(
      { error: "Missing signSlug or landmarks" },
      { status: 400 }
    );
  }

  // Load sign data
  const sign = loadSignDetail(signSlug);
  if (!sign) {
    return NextResponse.json({ error: "Sign not found" }, { status: 404 });
  }

  // Build context
  const context = buildContext(sign, landmarks, duration);
  const userPrompt = buildUserPrompt(context);

  // Call Claude
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });

  // Add language instruction for non-English locales
  const localeLanguageMap: Record<string, string> = {
    es: "Spanish",
    fr: "French",
    zh: "Chinese",
    ko: "Korean",
    ja: "Japanese",
  };

  let systemPrompt = SYSTEM_PROMPT;
  if (locale && locale !== "en" && localeLanguageMap[locale]) {
    systemPrompt += `\n\nIMPORTANT: Respond entirely in ${localeLanguageMap[locale]}. Keep ASL sign names and ASL-LEX technical terms in English.`;
  }

  try {
    const stream = await client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    // Return streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
