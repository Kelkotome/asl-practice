import type { LearningPath } from "./types";

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: "first-20-signs",
    name: "Your First 20 Signs",
    description:
      "The most essential signs for everyday conversation. Start here if you're brand new to ASL.",
    icon: "👋",
    difficulty: 1,
    featured: true,
    signSlugs: [
      "hello", "bye", "please", "thank-you", "sorry",
      "yes", "no", "more", "want", "like",
      "i", "my", "your", "what", "where",
      "good", "bad", "know", "understand", "how-are-you",
    ],
  },
  {
    slug: "fingerspelling-a-z",
    name: "Fingerspelling A–Z",
    description:
      "Learn the manual alphabet. Essential for spelling names, places, and unfamiliar words.",
    icon: "🔤",
    difficulty: 1,
    featured: true,
    signSlugs: "abcdefghijklmnopqrstuvwxyz".split(""),
  },
  {
    slug: "numbers-1-20",
    name: "Numbers 1–20",
    description:
      "Count from 1 to 20 in ASL. Useful for ages, prices, addresses, and more.",
    icon: "🔢",
    difficulty: 1,
    featured: true,
    signSlugs: Array.from({ length: 20 }, (_, i) => String(i + 1)),
  },
  {
    slug: "family-and-people",
    name: "Family & People",
    description:
      "Signs for family members and the people in your life.",
    icon: "👨‍👩‍👧",
    difficulty: 1,
    featured: false,
    signSlugs: [
      "family", "parents", "mother", "sister", "daughter",
      "son", "husband", "wife", "baby", "boy",
      "woman", "friend", "teacher", "boyfriend", "people",
    ],
  },
  {
    slug: "feelings-and-emotions",
    name: "Feelings & Emotions",
    description:
      "Express how you feel. These signs come up constantly in everyday conversation.",
    icon: "😊",
    difficulty: 1,
    featured: true,
    signSlugs: [
      "happy", "sad", "love", "hate", "excited",
      "confused", "scared", "sick", "hungry", "sorry",
      "laugh", "cry", "calm", "stress", "worry",
    ],
  },
  {
    slug: "animals",
    name: "Animals",
    description:
      "Fun animal signs — great for kids and visual learners.",
    icon: "🐾",
    difficulty: 2,
    featured: false,
    signSlugs: [
      "animal", "meow", "rabbit", "bug", "dolphin",
      "horse", "snake", "mouse", "lion", "elephant",
      "sheep", "duck", "bee", "butterfly", "deer",
    ],
  },
  {
    slug: "common-phrases",
    name: "Common Phrases",
    description:
      "Frequently used multi-sign phrases and expressions for daily interaction.",
    icon: "💬",
    difficulty: 1,
    featured: false,
    signSlugs: [
      "i-love-you", "thank-you", "are-you-okay", "how-are-you",
      "i-dont-know", "its-okay", "im-tired", "have-a-good-day",
      "have-a-good-night", "dont-know", "no-more", "i-want",
    ],
  },
  {
    slug: "food-and-drink",
    name: "Food & Drink",
    description:
      "Signs for meals, snacks, and beverages — perfect for mealtimes.",
    icon: "🍽️",
    difficulty: 1,
    featured: false,
    signSlugs: [
      "water", "coffee", "milk", "drink", "eat",
      "hungry", "bread", "cheese", "fruit", "strawberry",
      "wine", "onion", "butter", "bacon", "cookie",
    ],
  },
  {
    slug: "question-words",
    name: "Question Words",
    description:
      "Master the WH-questions and other interrogatives that form the backbone of ASL conversations.",
    icon: "❓",
    difficulty: 1,
    featured: false,
    signSlugs: [
      "what", "where", "when", "who", "why",
      "how", "which", "can", "what-for", "why-not",
    ],
  },
  {
    slug: "colors",
    name: "Colors",
    description:
      "Describe the world around you with basic color signs.",
    icon: "🎨",
    difficulty: 1,
    featured: false,
    signSlugs: [
      "black", "red", "green", "orange", "brown",
      "purple", "pink", "gray", "gold",
    ],
  },
];
