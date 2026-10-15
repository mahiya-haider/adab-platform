"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type ArticleItem = {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  author?: string;
  coverImage?: string;
  language?: string;
};

const emptyForm = {
  title: "",
  content: "",
  summary: "",
  author: "",
  coverImage: "",
  language: "Urdu",
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/articles", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load articles.");
      }

      setArticles(data.articles || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load articles."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  }

  function startEdit(article: ArticleItem) {
    setEditingId(article._id);
    setForm({
      title: article.title || "",
      content: article.content || "",
      summary: article.summary || "",
      author: article.author || "",
      coverImage: article.coverImage || "",
      language: article.language || "Urdu",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        editingId ? `/api/articles/${editingId}` : "/api/articles",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save article.");
      }

      setMessage(
        editingId
          ? "Article updated successfully."
          : "Article added successfully."
      );

      setForm(emptyForm);
      setEditingId(null);
      await loadArticles();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save article."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article: ArticleItem) {
    const confirmed = window.confirm(
      `Delete "${article.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/articles/${article._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete article.");
      }

      if (editingId === article._id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setMessage("Article deleted successfully.");
      await loadArticles();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete article."
      );
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#ddd7cb] bg-white px-4 py-3 text-sm text-[#34443b] outline-none transition focus:border-[#718574] focus:ring-2 focus:ring-[#dce5d8]";

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-8 text-[#34443b] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#788477]">
              Adab Platform · Administration
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl">
              Articles Management
            </h1>
            <p className="mt-3 text-sm text-[#77776f]">
              Create and manage literary articles.
            </p>
          </div>

          <Link
            href="/admin/suggestions"
            className="rounded-full border border-[#d8d4c9] bg-white px-5 py-3 text-sm font-medium transition hover:bg-[#e7e2f1]"
          >
            ← Admin Dashboard
          </Link>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[400px_1fr]">
          <section className="rounded-3xl border border-[#e8e0d5] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl">
              {editingId ? "Edit Article" : "Add an Article"}
            </h2>
            <p className="mb-6 mt-2 text-sm text-[#77776f]">
              Complete the article details below.
            </p>

            {message && (
              <p role="status" className="mb-4 rounded-xl bg-[#e1e9de] p-3 text-sm">
                {message}
              </p>
            )}

            {error && (
              <p role="alert" className="mb-4 rounded-xl bg-[#f0dfe4] p-3 text-sm">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
                  Article Title *
                </label>
                <input
                  id="title"
                  className={inputClass}
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Enter article title"
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label htmlFor="author" className="mb-1.5 block text-sm font-medium">
                  Author
                </label>
                <input
                  id="author"
                  className={inputClass}
                  value={form.author}
                  onChange={(e) =>
                    setForm({ ...form, author: e.target.value })
                  }
                  placeholder="Author name"
                  maxLength={150}
                />
              </div>

              <div>
                <label htmlFor="summary" className="mb-1.5 block text-sm font-medium">
                  Summary
                </label>
                <textarea
                  id="summary"
                  className={inputClass}
                  value={form.summary}
                  onChange={(e) =>
                    setForm({ ...form, summary: e.target.value })
                  }
                  placeholder="A short article summary"
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div>
                <label htmlFor="content" className="mb-1.5 block text-sm font-medium">
                  Article Content *
                </label>
                <textarea
                  id="content"
                  className={inputClass}
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  placeholder="Write the complete article..."
                  rows={8}
                  maxLength={30000}
                  required
                />
              </div>

              <div>
                <label htmlFor="coverImage" className="mb-1.5 block text-sm font-medium">
                  Cover Image URL
                </label>
                <input
                  id="coverImage"
                  type="url"
                  className={inputClass}
                  value={form.coverImage}
                  onChange={(e) =>
                    setForm({ ...form, coverImage: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
                {form.coverImage && (
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    className="mt-3 h-36 w-full rounded-xl object-cover"
                  />
                )}
              </div>

              <div>
                <label htmlFor="language" className="mb-1.5 block text-sm font-medium">
                  Language
                </label>
                <select
                  id="language"
                  className={inputClass}
                  value={form.language}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value })
                  }
                >
                  <option value="Urdu">Urdu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Roman Urdu">Roman Urdu</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-[#34443b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#4d6252] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Article"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-full border border-[#ddd7cb] px-5 py-3 text-sm font-medium hover:bg-[#f8f5ef]"
                >
                  Cancel Editing
                </button>
              )}
            </form>
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl">All Articles</h2>
                <p className="mt-1 text-sm text-[#77776f]">
                  {articles.length} {articles.length === 1 ? "article" : "articles"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadArticles()}
                className="rounded-full border border-[#d8d4c9] bg-white px-4 py-2.5 text-sm hover:bg-[#e1e9de]"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-[#e8e0d5] bg-white p-10 text-center text-sm text-[#77776f]">
                Loading articles...
              </div>
            ) : articles.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d8d4c9] bg-white p-10 text-center">
                <h3 className="font-serif text-xl">No articles found</h3>
                <p className="mt-2 text-sm text-[#77776f]">
                  Add your first article using the form.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {articles.map((article) => (
                  <article
                    key={article._id}
                    className="overflow-hidden rounded-3xl border border-[#e8e0d5] bg-white shadow-sm"
                  >
                    {article.coverImage && (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        loading="lazy"
                        className="h-44 w-full object-cover"
                      />
                    )}

                    <div className="p-5">
                      <span className="rounded-full bg-[#e1e9de] px-3 py-1 text-xs">
                        {article.language || "Urdu"}
                      </span>

                      <h3 className="mt-3 font-serif text-xl">
                        {article.title}
                      </h3>

                      {article.author && (
                        <p className="mt-1 text-sm text-[#77776f]">
                          By {article.author}
                        </p>
                      )}

                      {article.summary && (
                        <p className="mt-3 text-sm leading-6 text-[#66685f]">
                          {article.summary}
                        </p>
                      )}

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#555b53]">
                        {article.content.length > 300
                          ? `${article.content.slice(0, 300)}…`
                          : article.content}
                      </p>

                      <div className="mt-5 flex gap-3 border-t border-[#eee8df] pt-4">
                        <button
                          type="button"
                          onClick={() => startEdit(article)}
                          className="flex-1 rounded-full bg-[#e1e9de] px-4 py-2.5 text-sm font-semibold hover:bg-[#d2dfce]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(article)}
                          className="flex-1 rounded-full bg-[#f0dfe4] px-4 py-2.5 text-sm font-semibold hover:bg-[#e8cbd3]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}