"use client";

import { useCallback, useEffect, useState } from "react";

type Author = {
  _id: string;
  name: string;
  penName?: string;
  biography?: string;
  profileImage?: string;
  language?: string;
};

const emptyForm = {
  name: "",
  penName: "",
  biography: "",
  profileImage: "",
  language: "Urdu",
};

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#dedbd2] bg-white px-4 py-3 text-sm outline-none focus:border-[#687b68]";

  const loadAuthors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/authors");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load authors.");
      }

      setAuthors(data.authors || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load authors."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAuthors();
  }, [loadAuthors]);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function startEdit(author: Author) {
    setEditingId(author._id);
    setForm({
      name: author.name || "",
      penName: author.penName || "",
      biography: author.biography || "",
      profileImage: author.profileImage || "",
      language: author.language || "Urdu",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        editingId ? `/api/authors/${editingId}` : "/api/authors",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save author.");
      }

      setMessage(
        editingId
          ? "Author updated successfully."
          : "Author added successfully."
      );

      setForm(emptyForm);
      setEditingId(null);
      await loadAuthors();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save author."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAuthor(author: Author) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${author.name}"?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/authors/${author._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete author.");
      }

      if (editingId === author._id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setMessage("Author deleted successfully.");
      await loadAuthors();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete author."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-8 text-[#34443b] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#788675]">
              Adab Platform · Admin
            </p>
            <h1 className="font-serif text-4xl">Manage Authors</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create and manage author profiles and biographies.
            </p>
          </div>

          <a
            href="/admin/suggestions"
            className="rounded-xl border border-[#d8d5ca] bg-white px-4 py-3 text-sm font-medium hover:bg-[#e1e9de]"
          >
            Back to Admin
          </a>
        </header>

        <section className="mb-8 rounded-2xl border border-[#e5e0d6] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 font-serif text-2xl">
            {editingId ? "Edit Author" : "Add New Author"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Author Name *
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  placeholder="Enter author name"
                  required
                />
              </label>

              <label className="block text-sm font-medium">
                Pen Name
                <input
                  className={inputClass}
                  value={form.penName}
                  onChange={(event) =>
                    updateField("penName", event.target.value)
                  }
                  placeholder="Enter pen name"
                />
              </label>

              <label className="block text-sm font-medium">
                Language
                <select
                  className={inputClass}
                  value={form.language}
                  onChange={(event) =>
                    updateField("language", event.target.value)
                  }
                >
                  <option value="Urdu">Urdu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Roman">Roman</option>
                </select>
              </label>

              <label className="block text-sm font-medium">
                Profile Image URL
                <input
                  className={inputClass}
                  type="url"
                  value={form.profileImage}
                  onChange={(event) =>
                    updateField("profileImage", event.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </label>
            </div>

            <label className="block text-sm font-medium">
              Biography
              <textarea
                className={inputClass}
                value={form.biography}
                onChange={(event) =>
                  updateField("biography", event.target.value)
                }
                placeholder="Write the author's biography..."
                rows={5}
              />
            </label>

            {message && (
              <p role="status" className="text-sm text-green-700">
                {message}
              </p>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#34443b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#26352c] disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Author"
                    : "Add Author"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl border border-[#dedbd2] px-6 py-3 text-sm font-medium hover:bg-[#f8f5ef]"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={() => void loadAuthors()}
                className="rounded-xl border border-[#dedbd2] px-6 py-3 text-sm font-medium hover:bg-[#f8f5ef]"
              >
                Refresh
              </button>
            </div>
          </form>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl">Author Profiles</h2>
            <span className="rounded-full bg-[#e1e9de] px-3 py-1 text-sm">
              {authors.length} authors
            </span>
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-600">
              Loading authors...
            </p>
          ) : authors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d8d5ca] bg-white p-10 text-center">
              <h3 className="font-serif text-xl">No authors yet</h3>
              <p className="mt-2 text-sm text-gray-600">
                Add your first author using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {authors.map((author) => (
                <article
                  key={author._id}
                  className="rounded-2xl border border-[#e5e0d6] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {author.profileImage ? (
                      <img
                        src={author.profileImage}
                        alt={author.name}
                        className="h-20 w-20 rounded-xl border border-[#e5e0d6] object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#e7e2f1] font-serif text-3xl">
                        {author.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-xl">{author.name}</h3>

                      {author.penName && (
                        <p className="mt-1 text-sm text-gray-600">
                          Pen name: {author.penName}
                        </p>
                      )}

                      <p className="mt-2 text-xs uppercase tracking-wide text-[#788675]">
                        {author.language || "Urdu"}
                      </p>
                    </div>
                  </div>

                  {author.biography && (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {author.biography}
                    </p>
                  )}

                  <div className="mt-5 flex gap-3 border-t border-[#eee9df] pt-4">
                    <button
                      type="button"
                      onClick={() => startEdit(author)}
                      className="rounded-lg bg-[#e1e9de] px-4 py-2 text-sm font-medium hover:bg-[#d3dfd1]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void deleteAuthor(author)}
                      className="rounded-lg bg-[#f0dfe4] px-4 py-2 text-sm font-medium hover:bg-[#e8cfd7]"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}