"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type KalaamItem = {
  _id: string;
  title?: string;
  content: string;
  type?: string;
  poet?: string | { _id?: string; name?: string; penName?: string } | null;
  poetName?: string;
  language?: string;
};

const emptyForm = {
  title: "",
  content: "",
  type: "ghazal",
  poet: "",
  language: "Urdu",
};

const kalaamTypes = [
  "ghazal",
  "naat",
  "manqabat",
  "sher",
  "bait",
  "qitaa",
  "other",
];

function getPoetName(item: KalaamItem): string {
  if (item.poetName?.trim()) return item.poetName;

  if (typeof item.poet === "string") return item.poet;

  if (item.poet && typeof item.poet === "object") {
    return item.poet.penName || item.poet.name || "";
  }

  return "";
}

export default function AdminKalaamPage() {
  const [items, setItems] = useState<KalaamItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadKalaam = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/kalaam", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load Kalaam.");
      }

      setItems(Array.isArray(data.kalaam) ? data.kalaam : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load Kalaam."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKalaam();
  }, [loadKalaam]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  }

  function startEdit(item: KalaamItem) {
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      content: item.content || "",
      type: item.type || "other",
      poet: getPoetName(item),
      language: item.language || "Urdu",
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
        editingId ? `/api/kalaam/${editingId}` : "/api/kalaam",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save Kalaam.");
      }

      setMessage(
        editingId
          ? "Kalaam updated successfully."
          : "Kalaam added successfully."
      );

      setForm(emptyForm);
      setEditingId(null);
      await loadKalaam();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save Kalaam."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: KalaamItem) {
    const confirmed = window.confirm(
      `Delete "${item.title || item.content.slice(0, 50)}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/kalaam/${item._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete Kalaam.");
      }

      if (editingId === item._id) {
        setForm(emptyForm);
        setEditingId(null);
      }

      setMessage("Kalaam deleted successfully.");
      await loadKalaam();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete Kalaam."
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
              Kalaam Management
            </h1>
            <p className="mt-3 text-sm text-[#77776f]">
              Manage poetry, ghazals, naat and other literary works.
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
              {editingId ? "Edit Kalaam" : "Add Kalaam"}
            </h2>
            <p className="mb-6 mt-2 text-sm text-[#77776f]">
              Enter the literary work details below.
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
                  Title
                </label>
                <input
                  id="title"
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter title (optional)"
                  maxLength={200}
                />
              </div>

              <div>
                <label htmlFor="content" className="mb-1.5 block text-sm font-medium">
                  Kalaam Content *
                </label>
                <textarea
                  id="content"
                  className={inputClass}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter the complete Kalaam..."
                  rows={8}
                  maxLength={30000}
                  required
                />
              </div>

              <div>
                <label htmlFor="poet" className="mb-1.5 block text-sm font-medium">
                  Poet Name
                </label>
                <input
                  id="poet"
                  className={inputClass}
                  value={form.poet}
                  onChange={(e) => setForm({ ...form, poet: e.target.value })}
                  placeholder="e.g. Mirza Ghalib"
                  maxLength={150}
                />
              </div>

              <div>
                <label htmlFor="type" className="mb-1.5 block text-sm font-medium">
                  Kalaam Type
                </label>
                <select
                  id="type"
                  className={inputClass}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {kalaamTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
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
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
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
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Kalaam"}
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
                <h2 className="font-serif text-2xl">All Kalaam</h2>
                <p className="mt-1 text-sm text-[#77776f]">
                  {items.length} {items.length === 1 ? "entry" : "entries"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadKalaam()}
                className="rounded-full border border-[#d8d4c9] bg-white px-4 py-2.5 text-sm hover:bg-[#e1e9de]"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-[#e8e0d5] bg-white p-10 text-center text-sm text-[#77776f]">
                Loading Kalaam...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d8d4c9] bg-white p-10 text-center">
                <h3 className="font-serif text-xl">No Kalaam found</h3>
                <p className="mt-2 text-sm text-[#77776f]">
                  Add your first literary work using the form.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {items.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-3xl border border-[#e8e0d5] bg-white p-5 shadow-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#e1e9de] px-3 py-1 text-xs font-medium">
                        {item.type || "other"}
                      </span>
                      <span className="rounded-full bg-[#f0dfe4] px-3 py-1 text-xs">
                        {item.language || "Urdu"}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl">
                      {item.title || "Untitled Kalaam"}
                    </h3>

                    {getPoetName(item) && (
                      <p className="mt-1 text-sm text-[#77776f]">
                        By {getPoetName(item)}
                      </p>
                    )}

                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#555b53]">
                      {item.content.length > 500
                        ? `${item.content.slice(0, 500)}…`
                        : item.content}
                    </p>

                    <div className="mt-5 flex gap-3 border-t border-[#eee8df] pt-4">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="flex-1 rounded-full bg-[#e1e9de] px-4 py-2.5 text-sm font-semibold hover:bg-[#d2dfce]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
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