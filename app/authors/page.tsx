"use client";

import { useEffect, useState } from "react";

type Author = {
  _id: string;
  name: string;
  penName: string;
  biography: string;
  profileImage: string;
  language: string;
};

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAuthors() {
      try {
        const response = await fetch("/api/authors");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Failed to load authors.");
        }

        setAuthors(data.authors);
      } catch {
        setError("Unable to laod authors. Please try agian.");
      } finally {
        setLoading(false);
      }
    }

    fetchAuthors();
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">Authors</h1>

        <p className="mt-3 text-gray-600">
          Explore authors and discover their books and literary works.
        </p>

        {loading ? (
          <p className="mt-10 text-gray-600">Loading authors...</p>
        ) : error ? (
          <p className="mt-10 text-red-600">{error}</p>
        ) : authors.length === 0 ? (
          <p className="mt-10 text-gray-600">
            NO authors are available at the moment.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <div
                key={author._id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                    {author.profileImage ? (
                      <img
                        src={author.profileImage}
                        alt={author.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">Photo</span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">
                      {author.name}
                    </h2>

                    {author.penName && (
                      <p className="text-sm text-gray-500">
                        {author.penName}
                      </p>
                    )}

                    <p className="text-sm text-gray-500">Author</p>
                  </div>
                </div>

                {author.biography && (
                  <p className="mt-4 text-sm text-gray-600">
                    {author.biography}
                  </p>
                )}

                <p className="mt-3 text-xs text-gray-500">
                  Language: {author.language}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}