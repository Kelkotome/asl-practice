import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ASL Practice",
  description:
    "Learn how ASL Practice by Deafened.org handles your data. We don't store your camera footage, personal information, or practice history on our servers.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Last updated: March 19, 2026
      </p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            Your Privacy Matters
          </h2>
          <p>
            ASL Practice by Deafened.org is designed with privacy at its core.
            We believe you should be able to practice sign language freely
            without worrying about your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            Camera & Video Data
          </h2>
          <p>
            When you use the practice feature, your camera feed is processed
            entirely in your browser using MediaPipe hand tracking. <strong>No
            video or camera footage is ever sent to our servers or stored
            anywhere.</strong> All hand-tracking analysis happens locally on your
            device.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            AI Coaching Feedback
          </h2>
          <p>
            When you request feedback on your signing, only the extracted hand
            landmark coordinates (numerical data points describing hand position
            and shape) are sent to our server for AI analysis. No images or
            video frames are transmitted. These coordinates are not stored after
            the feedback is generated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            Practice Progress
          </h2>
          <p>
            Your practice history, streaks, and learning path progress are
            stored locally in your browser (localStorage). This data never
            leaves your device and is not accessible to us. Clearing your
            browser data will reset your progress.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            No Accounts or Personal Information
          </h2>
          <p>
            ASL Practice does not require account creation, login, or any
            personal information. We do not collect your name, email address, or
            any other identifying information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            Cookies & Analytics
          </h2>
          <p>
            We do not use tracking cookies or third-party analytics services.
            The only data stored in your browser is your practice progress via
            localStorage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            Third-Party Services
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>YouTube</strong> — Reference sign videos are embedded from
              YouTube. YouTube&apos;s own privacy policy applies to video
              playback.
            </li>
            <li>
              <strong>MediaPipe</strong> — Google&apos;s hand tracking library
              runs entirely in your browser. No data is sent to Google.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            Data Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left font-medium">Data</th>
                  <th className="px-4 py-2 text-left font-medium">Collected?</th>
                  <th className="px-4 py-2 text-left font-medium">Stored?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">Camera / video footage</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">No</td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">Hand landmark coordinates</td>
                  <td className="px-4 py-2">Only for feedback requests</td>
                  <td className="px-4 py-2">No</td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">Practice progress</td>
                  <td className="px-4 py-2">No (browser only)</td>
                  <td className="px-4 py-2">Browser localStorage only</td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">Personal information</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">No</td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">Cookies / tracking</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
            Contact
          </h2>
          <p>
            If you have questions about this privacy policy, reach out via{" "}
            <a
              href="https://deafened.org"
              className="text-brand-600 hover:text-brand-700 underline"
            >
              Deafened.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
