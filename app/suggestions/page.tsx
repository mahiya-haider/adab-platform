"use client";

import { useState } from "react";

export default function SuggestionsPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [reason, setReason] = useState("");
  const [suggestedBy, setSuggestedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookTitle: title.trim(),
          authorName: author.trim(),
          reason: reason.trim(),
          suggestedBy: suggestedBy.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "We could not submit your suggestion. Please try again."
        );
      }

      setSuccess(true);
      setMessage(
        "Thank you for your contribution. Your book suggestion has been submitted successfully."
      );

      setTitle("");
      setAuthor("");
      setReason("");
      setSuggestedBy("");
    } catch (error) {
      setSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-800">
            Adab Platform
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            Suggest a Book
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-600">
            Help us preserve and celebrate literature. Recommend a book
            that you believe deserves to be part of our collection.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label
              htmlFor="book-title"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Book Title <span className="text-red-600">*</span>
            </label>

            <input
              id="book-title"
              name="bookTitle"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the book title"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-amber-800 focus:ring-2 focus:ring-amber-800/20"
            />
          </div>

          <div>
            <label
              htmlFor="book-author"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Author Name <span className="text-red-600">*</span>
            </label>

            <input
              id="book-author"
              name="authorName"
              type="text"
              required
              maxLength={200}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter the author's name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-amber-800 focus:ring-2 focus:ring-amber-800/20"
            />
          </div>

          <div>
            <label
              htmlFor="book-reason"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Why Do You Recommend This Book?
            </label>

            <textarea
              id="book-reason"
              name="reason"
              rows={4}
              maxLength={2000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Share what makes this book special..."
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-amber-800 focus:ring-2 focus:ring-amber-800/20"
            />
          </div>

          <div>
            <label
              htmlFor="suggested-by"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Your Name <span className="text-gray-500">(Optional)</span>
            </label>

            <input
              id="suggested-by"
              name="suggestedBy"
              type="text"
              maxLength={100}
              value={suggestedBy}
              onChange={(e) => setSuggestedBy(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-amber-800 focus:ring-2 focus:ring-amber-800/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Book Suggestion"}
          </button>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-lg border p-4 text-sm leading-6 ${
                success
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {message}
            </p>
          )}

          <p className="text-center text-xs text-gray-500">
            Fields marked with * are required.
          </p>
        </form>
      </div>
    </main>
  );
}