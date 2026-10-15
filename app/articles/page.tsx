"use client";

import { useEffect, useState } from "react";

type Article = {
_id: string;
title: string;
content: string;
summary?: string;
author?: string;
language: string;
image?: string;
};

export default function ArticlesPage() {
const [articles, setArticles] = useState<Article[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
async function fetchArticles() {
try {
const response = await fetch("/api/articles");
const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Failed to laod articles.");
    }

    setArticles(Array.isArray(data.articles) ? data.articles : []);
  } catch {
    setError("Unable to laod articles.Please try again.");
  } finally {
    setLoading(false);
  }
}

fetchArticles();

}, []);

return (
<main className="min-h-screen bg-[#f8f5ef] px-6 py-12">
<div className="mx-auto max-w-7xl">
<h1 className="text-4xl font-bold">Articles</h1>

    <p className="mt-3 text-gray-600">
      Read articles, stories and insights from the world of literature.
    </p>

    {loading ? (
      <p className="mt-10 text-gray-600">Loading articles...</p>
    ) : error ? (
      <p className="mt-10 text-red-600">{error}</p>
    ) : articles.length === 0 ? (
      <p className="mt-10 text-gray-600">
        No articles are available at the moment.
      </p>
    ) : (
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article
            key={article._id}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
              {article.image ? (
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-gray-500">Article Image</span>
              )}
            </div>

            <p className="mt-5 text-sm text-gray-500">
              {article.language || "Literature"}
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              {article.title}
            </h2>

            {article.author && (
              <p className="mt-2 text-sm text-gray-500">
                By {article.author}
              </p>
            )}

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {article.summary || article.content}
            </p>

            <details className="mt-4">
              <summary className="cursor-pointer rounded-lg bg-black px-4 py-2 text-center text-sm text-white">
                Read Article
              </summary>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {article.content}
              </div>
            </details>
          </article>
        ))}
      </div>
    )}
  </div>
</main>

);
}