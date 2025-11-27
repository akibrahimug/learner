"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SubscriptionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Subscription page error:", error);
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold">Subscription Unavailable</h1>
        <p className="text-gray-600">
          We're having trouble loading the subscription page. This might be due to configuration issues.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-primary px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Go Home
          </Link>
        </div>
        <p className="text-sm text-gray-500">
          If this problem persists, please contact support.
        </p>
      </div>
    </main>
  );
}
