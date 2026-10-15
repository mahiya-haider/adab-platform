"use client";

import { useEffect, useState } from "react";

type Kalaam = {
  _id: string;
  title?: string;
  content: string;
  type: string;
  poetName?: string;
  poet?: string | { name?: string; penName?: string } | null;
  language: string;
};

const categories = [
  {
    type: "ghazal",
    title: "Ghazal",
    description: "Explore beautiful ghazals from renowned poets.",
  },
  {
    type: "naat",
    title: "Naat",
    description: "Discover devotional poetry and naat.",
  },
  {
    type: "manqabat",
    title: "Manqabat",
    description: "Explore traditional manqabats and devotional works.",
  },
  {
    type: "sher",
    title: "Sher",
    description: "Read memorable individual verses and sher.",
  },
  {
    type: "bait",
    title: "Bait",
    description: "Explore classical poetic verses and bait.",
  },
  {
    type: "qitaa",
    title: "Qit’aa",
    description: "Discover qit’aa and other forms of poetry.",
  },
  {
    type: "other",
    title: "Other Works",
    description: "Discover more poetry and literary works.",
  },
];

function getPoetName(item: Kalaam): string {
  if (item.poetName?.trim()) return item.poetName;

  if (typeof item.poet === "string") return item.poet;

  if (item.poet && typeof item.poet === "object") {
    return item.poet.penName || item.poet.name || "";
  }

  return "";
}

export default function KalaamPage() {
  const [kalaam, setKalaam] = useState<Kalaam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchKalaam() {
      try {
        const response = await fetch("/api/kalaam", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Failed to load Kalaam.");
        }

        setKalaam(Array.isArray(data.kalaam) ? data.kalaam : []);
      } catch {
        setError("Unable to load Kalaam. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void fetchKalaam();
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-12 text-[#34443b]">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-serif text-4xl font-bold">Kalaam</h1>

        <p className="mt-3 text-gray-600">
          Explore poetry, verses and literary works from different traditions.
        </p>

        {loading ? (
          <p className="mt-10 text-gray-600">Loading Kalaam...</p>
        ) : error ? (
          <p role="alert" className="mt-10 text-red-600">
            {error}
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const matchingKalaam = kalaam.filter(
                (item) =>
                  item.type?.toLowerCase().trim() === category.type
              );

              return (
                <section
                  key={category.type}
                  className="rounded-2xl border border-[#e8e0d5] bg-white p-6 shadow-sm transition hover:-translate-y-1"
                >
                  <h2 className="font-serif text-2xl font-semibold">
                    {category.title}
                  </h2>

                  <p className="mt-3 text-sm text-gray-600">
                    {category.description}
                  </p>

                  <p className="mt-4 text-xs text-gray-500">
                    {matchingKalaam.length}{" "}
                    {matchingKalaam.length === 1 ? "work" : "works"}
                  </p>

                  {matchingKalaam.map((item) => (
                    <article
                      key={item._id}
                      className="mt-4 rounded-xl bg-[#f8f5ef] p-4"
                    >
                      <h3 className="font-semibold">
                        {item.title?.trim() || "Untitled Kalaam"}
                      </h3>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                        {item.content}
                      </p>

                      {getPoetName(item) && (
                        <p className="mt-3 text-sm text-gray-600">
                          Poet: {getPoetName(item)}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-gray-500">
                        Language: {item.language || "Not specified"}
                      </p>
                    </article>
                  ))}
                </section>
              );
            })}
          </div>
        )}

        {!loading && !error && kalaam.length === 0 && (
          <p className="mt-8 text-gray-600">
            No Kalaam is available at the moment.
          </p>
        )}
      </div>
    </main>
  );
}