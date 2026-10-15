"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type Poet = {
  _id: string;
  name: string;
  penName?: string;
  biography?: string;
  profileImage?: string;
  type?: string;
  language?: string;
};

const emptyForm = {
  name: "",
  penName: "",
  biography: "",
  profileImage: "",
  type: "poet",
  language: "Urdu",
};

export default function AdminPoetsPage() {
  const [poets, setPoets] = useState<Poet[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPoets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/poets", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load poets.");
      }

      setPoets(data.poets || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load poets."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPoets();
  }, [loadPoets]);

  function startEdit(poet: Poet) {
    setEditingId(poet._id);
    setForm({
      name: poet.name || "",
      penName: poet.penName || "",
      biography: poet.biography || "",
      profileImage: poet.profileImage || "",
      type: poet.type || "poet",
      language: poet.language || "Urdu",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        editingId ? `/api/poets/${editingId}` : "/api/poets",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save poet.");
      }

      setMessage(
        editingId
          ? "Poet updated successfully."
          : "Poet added successfully."
      );
      setForm(emptyForm);
      setEditingId(null);
      await loadPoets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save poet."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(poet: Poet) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${poet.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/poets/${poet._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete poet.");
      }

      if (editingId === poet._id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setMessage("Poet deleted successfully.");
      await loadPoets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete poet."
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
              Poets Management
            </h1>
            <p className="mt-3 text-sm text-[#77776f]">
              Add, update and manage poet profiles.
            </p>
          </div>

          <Link
            href="/admin/suggestions"
            className="rounded-full border border-[#d8d4c9] bg-white px-5 py-3 text-sm font-medium transition hover:bg-[#e7e2f1]"
          >
            ← Admin Dashboard
          </Link>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[380px_1fr]">
          <section className="rounded-3xl border border-[#e8e0d5] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl">
              {editingId ? "Edit Poet" : "Add a Poet"}
            </h2>
            <p className="mb-6 mt-2 text-sm text-[#77776f]">
              Complete the details below.
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
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                  Poet Name *
                </label>
                <input
                  id="name"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Mirza Ghalib"
                  required
                  maxLength={150}
                />
              </div>

              <div>
                <label htmlFor="penName" className="mb-1.5 block text-sm font-medium">
                  Pen Name
                </label>
                <input
                  id="penName"
                  className={inputClass}
                  value={form.penName}
                  onChange={(e) =>
                    setForm({ ...form, penName: e.target.value })
                  }
                  placeholder="Pen name (optional)"
                  maxLength={150}
                />
              </div>

              <div>
                <label htmlFor="biography" className="mb-1.5 block text-sm font-medium">
                  Biography
                </label>
                <textarea
                  id="biography"
                  className={inputClass}
                  value={form.biography}
                  onChange={(e) =>
                    setForm({ ...form, biography: e.target.value })
                  }
                  placeholder="Write a short biography..."
                  rows={4}
                  maxLength={10000}
                />
              </div>

              <div>
                <label htmlFor="profileImage" className="mb-1.5 block text-sm font-medium">
                  Profile Image URL
                </label>
                <input
                  id="profileImage"
                  type="url"
                  className={inputClass}
                  value={form.profileImage}
                  onChange={(e) =>
                    setForm({ ...form, profileImage: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label htmlFor="type" className="mb-1.5 block text-sm font-medium">
                  Profile Type
                </label>
                <select
                  id="type"
                  className={inputClass}
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                >
                  <option value="poet">Poet</option>
                  <option value="author">Author</option>
                </select>
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
                    : "Add Poet"}
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
                <h2 className="font-serif text-2xl">All Poets</h2>
                <p className="mt-1 text-sm text-[#77776f]">
                  {poets.length} {poets.length === 1 ? "profile" : "profiles"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadPoets()}
                className="rounded-full border border-[#d8d4c9] bg-white px-4 py-2.5 text-sm hover:bg-[#e1e9de]"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-[#e8e0d5] bg-white p-10 text-center text-sm text-[#77776f]">
                Loading poets...
              </div>
            ) : poets.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d8d4c9] bg-white p-10 text-center">
                <h3 className="font-serif text-xl">No poets found</h3>
                <p className="mt-2 text-sm text-[#77776f]">
                  Add your first poet using the form.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {poets.map((poet) => (
                  <article
                    key={poet._id}
                    className="overflow-hidden rounded-3xl border border-[#e8e0d5] bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      {poet.profileImage ? (
                        <img
                          src={poet.profileImage}
                          alt={poet.name}
                          className="h-20 w-20 shrink-0 rounded-2xl bg-[#e1e9de] object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#e7e2f1] font-serif text-3xl">
                          {poet.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-serif text-xl">
                          {poet.name}
                        </h3>
                        {poet.penName && (
                          <p className="mt-1 break-words text-sm text-[#77776f]">
                            {poet.penName}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#e1e9de] px-3 py-1 text-xs">
                            {poet.type || "poet"}
                          </span>
                          <span className="rounded-full bg-[#f0dfe4] px-3 py-1 text-xs">
                            {poet.language || "Urdu"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {poet.biography && (
                      <p className="mt-4 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#66685f]">
                        {poet.biography}
                      </p>
                    )}

                    <div className="mt-5 flex gap-3 border-t border-[#eee8df] pt-4">
                      <button
                        type="button"
                        onClick={() => startEdit(poet)}
                        className="flex-1 rounded-full bg-[#e1e9de] px-4 py-2.5 text-sm font-semibold hover:bg-[#d2dfce]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(poet)}
                        className="flex-1 rounded-full bg-[#f0dfe4] px-4 py-2.5 text-sm font-semibold hover:bg-[#e8cbd3]"
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
      </div>
    </main>
  );
}