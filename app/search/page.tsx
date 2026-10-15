"use client";

import { useState } from "react";

type SearchItem = {
  id: string;
  title: string;
  type: string;
  description?: string;
};

const API_ENDPOINTS = [
  { endpoint: "/api/books", type: "Book" },
  { endpoint: "/api/poets", type: "Poet" },
  { endpoint: "/api/authors", type: "Author" },
  { endpoint: "/api/kalaam", type: "Kalaam" },
  { endpoint: "/api/articles", type: "Article" },
];

function getTitle(item: Record<string, unknown>, type: string) {
  const fields =
    type === "Book"
      ? ["title", "bookTitle", "name"]
      : type === "Kalaam"
        ? ["title", "name"]
        : ["name", "title", "bookTitle"];

  for (const field of fields) {
    if (typeof item[field] === "string" && item[field].trim()) {
      return item[field].trim();
    }
  }

  return "";
}

function getDescription(item: Record<string, unknown>) {
  for (const field of ["description", "biography", "summary", "content", "bio"]) {
    if (typeof item[field] === "string" && item[field].trim()) {
      return item[field].trim();
    }
  }

  return "";
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    const search = query.trim().toLowerCase();

    if (!search) {
      setResults([]);
      setSearched(false);
      setError("");
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const responses = await Promise.all(
        API_ENDPOINTS.map(async ({ endpoint, type }) => {
          const response = await fetch(endpoint);

          if (!response.ok) {
            throw new Error(`Unable to search ${type.toLowerCase()}s.`);
          }

          const data = await response.json();

          const key =
            type === "Book"
              ? "books"
              : type === "Poet"
                ? "poets"
                : type === "Author"
                  ? "authors"
                  : type === "Kalaam"
                    ? "kalaam"
                    : "articles";

          const records = Array.isArray(data[key]) ? data[key] : [];

          return records
            .filter(
              (item: Record<string, unknown>) =>
                item && typeof item === "object"
            )
            .map((item: Record<string, unknown>, index: number) => {
              const title = getTitle(item, type);

              return {
                id: String(item._id ?? `${type}-${index}-${title}`),
                title,
                type,
                description: getDescription(item),
              };
            })
            .filter((item: SearchItem) => item.title);
        })
      );

      const allItems = responses.flat();

      const matches = allItems.filter((item) => {
        const searchableText =
          `${item.title} ${item.type} ${item.description ?? ""}`.toLowerCase();

        return searchableText.includes(search);
      });

      setResults(matches);
    } catch {
      setResults([]);
      setError(
        "We could not load search results. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-800">
            Adab Platform
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            Search
          </h1>

          <p className="mt-3 text-gray-600">
            Discover poets, authors, books, Kalaam and articles.
          </p>
        </header>

        <form
          className="mt-8 flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSearch();
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search literature..."
            aria-label="Search literature"
            className="min-w-0 flex-1 px-5 py-4 text-gray-900 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 px-6 py-4 font-medium text-white transition hover:bg-gray-800 disabled:opacity-60 sm:px-7"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <section className="mt-10" aria-live="polite">
          <h2 className="text-2xl font-semibold text-gray-900">
            Search Results
          </h2>

          {loading && (
            <p className="mt-4 text-gray-600">
              Searching the collection...
            </p>
          )}

          {!loading && error && (
            <p className="mt-4 text-red-700">{error}</p>
          )}

          {!loading && !error && searched && results.length === 0 && (
            <p className="mt-4 text-gray-600">
              No matching results were found. Try a different search term.
            </p>
          )}

          {!searched && !loading && (
            <p className="mt-4 text-gray-600">
              Enter a title or keyword to explore the collection.
            </p>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {results.map((item) => (
              <article
                key={`${item.type}-${item.id}`}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-amber-800">
                  {item.type}
                </p>

                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}