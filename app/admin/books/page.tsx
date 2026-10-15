"use client";

import { useCallback, useEffect, useState } from "react";

type Chapter = {
  title: string;
  content: string;
};

type Book = {
  _id: string;
  title: string;
  author?: string;
  description?: string;
  coverImage?: string;
  language?: string;
  content?: string;
  chapters?: Chapter[];
  readingDirection?: "ltr" | "rtl";
  isPublished?: boolean;
  accessType?: "free" | "membership";
};

type BookForm = {
  title: string;
  author: string;
  description: string;
  coverImage: string;
  language: string;
  content: string;
  chapters: Chapter[];
  readingDirection: "ltr" | "rtl";
  isPublished: boolean;
  accessType: "free" | "membership";
};

const emptyForm: BookForm = {
  title: "",
  author: "",
  description: "",
  coverImage: "",
  language: "Urdu",
  content: "",
  chapters: [],
  readingDirection: "rtl",
  isPublished: false,
  accessType: "free",
};

const languages = ["English", "Hindi", "Urdu", "Roman Urdu"];

export default function AdminBooksPage() {
  const [form, setForm] = useState<BookForm>(emptyForm);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fieldClass =
    "mt-2 w-full rounded-xl border border-[#E4DED5] bg-[#FFFEFC] px-4 py-3 text-[#34443B] outline-none focus:border-[#71816D]";

  const loadBooks = useCallback(async () => {
    setFetching(true);

    try {
      const response = await fetch("/api/books", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load books.");
      }

      setBooks(data.books);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load books.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => {
      const updated = { ...previous, [name]: value };

      if (name === "language" && previous.readingDirection === directionForLanguage(previous.language)) {
        updated.readingDirection = directionForLanguage(value);
      }

      return updated;
    });
  }

  
function directionForLanguage(language: string): "ltr" | "rtl" {
  return language === "Urdu" ? "rtl" : "ltr";
}


  function startEdit(book: Book) {
    setEditingId(book._id);

    setForm({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      coverImage: book.coverImage || "",
      language: book.language || "Urdu",
      content: book.content || "",
      chapters: (book.chapters || []).map((chapter) => ({
        title: chapter.title || "",
        content: chapter.content || "",
      })),
      readingDirection:
        book.readingDirection || directionForLanguage(book.language || "Urdu"),
      isPublished: book.isPublished === true,
      accessType: book.accessType === "membership" ? "membership" : "free",
    });

    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyForm, chapters: [] });
    setMessage("");
    setError("");
  }

  function addChapter() {
    setForm((previous) => ({
      ...previous,
      chapters: [...previous.chapters, { title: "", content: "" }],
    }));
  }

  function updateChapter(
    index: number,
    field: keyof Chapter,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      chapters: previous.chapters.map((chapter, chapterIndex) =>
        chapterIndex === index
          ? { ...chapter, [field]: value }
          : chapter
      ),
    }));
  }

  function removeChapter(index: number) {
    setForm((previous) => ({
      ...previous,
      chapters: previous.chapters.filter(
        (_, chapterIndex) => chapterIndex !== index
      ),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...form,
        chapters: form.chapters
          .filter((chapter) => chapter.title.trim())
          .map((chapter, index) => ({
            title: chapter.title.trim(),
            content: chapter.content,
            order: index + 1,
          })),
      };

      const response = await fetch(
        editingId ? `/api/books/${editingId}` : "/api/books",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save book.");
      }

      setMessage(
        editingId
          ? "Book updated successfully."
          : "Book added successfully."
      );

      setForm({ ...emptyForm, chapters: [] });
      setEditingId(null);
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(book: Book) {
    const confirmed = window.confirm(
      `Delete "${book.title}" permanently? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(book._id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/books/${book._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete book.");
      }

      if (editingId === book._id) cancelEdit();

      setMessage("Book deleted successfully.");
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete book.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F5F0] px-4 py-10 text-[#34443B] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <a
          href="/admin/suggestions"
          className="text-sm text-[#71816D] hover:underline"
        >
          ← Back to Suggestions
        </a>

        <header className="mt-6">
          <p className="text-xs font-medium tracking-[0.25em] text-[#9A6575]">
            ADAB ADMINISTRATION
          </p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
            Books Management
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#696963]">
            Manage book details, reading text, chapters and publication status.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-3xl border border-[#E4DED5] bg-[#FFFEFC] p-5 shadow-sm sm:p-8"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9A6575]">
              {editingId ? "Edit existing book" : "New collection entry"}
            </p>
            <h2 className="mt-2 font-serif text-2xl">
              {editingId ? "Update Book" : "Add a Book"}
            </h2>
          </div>

          <div>
            <label htmlFor="title" className="font-medium">
              Book Title *
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={200}
              className={fieldClass}
              placeholder="Enter book title"
            />
          </div>

          <div>
            <label htmlFor="author" className="font-medium">
              Author
            </label>
            <input
              id="author"
              name="author"
              value={form.author}
              onChange={handleChange}
              maxLength={150}
              className={fieldClass}
              placeholder="Enter author name"
            />
          </div>

          <div>
            <label htmlFor="description" className="font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              maxLength={5000}
              className={fieldClass}
              placeholder="Write a short description"
            />
          </div>

          <div>
            <label htmlFor="coverImage" className="font-medium">
              Cover Image URL
            </label>
            <input
              id="coverImage"
              name="coverImage"
              type="url"
              value={form.coverImage}
              onChange={handleChange}
              className={fieldClass}
              placeholder="https://example.com/book-cover.jpg"
            />
          </div>

          <div>
            <label htmlFor="language" className="font-medium">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={form.language}
              onChange={handleChange}
              className={fieldClass}
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          <section className="border-t border-[#E4DED5] pt-6">
            <h3 className="font-serif text-2xl">Reading Content</h3>
            <p className="mt-2 text-sm leading-6 text-[#696963]">
              Add text that you own or are authorized to publish. You can
              provide a complete text here or divide it into chapters below.
            </p>

            <label htmlFor="content" className="mt-5 block font-medium">
              Full Book Text
            </label>
            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={12}
              className={fieldClass}
              placeholder="Paste or type the book text here..."
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-serif text-xl">Chapters</h4>
              <button
                type="button"
                onClick={addChapter}
                className="rounded-xl border border-[#71816D] px-4 py-2 text-sm hover:bg-[#E1E9DE]"
              >
                + Add Chapter
              </button>
            </div>

            {form.chapters.map((chapter, index) => (
              <div
                key={index}
                className="mt-4 space-y-3 rounded-2xl border border-[#E4DED5] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h5 className="font-medium">Chapter {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeChapter(index)}
                    className="text-sm text-[#874554] hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <label htmlFor={`chapter-title-${index}`} className="block text-sm">
                  Chapter Title *
                </label>
                <input
                  id={`chapter-title-${index}`}
                  value={chapter.title}
                  onChange={(event) =>
                    updateChapter(index, "title", event.target.value)
                  }
                  className={fieldClass}
                  placeholder={`Enter chapter ${index + 1} title`}
                />

                <label htmlFor={`chapter-content-${index}`} className="block text-sm">
                  Chapter Text
                </label>
                <textarea
                  id={`chapter-content-${index}`}
                  value={chapter.content}
                  onChange={(event) =>
                    updateChapter(index, "content", event.target.value)
                  }
                  rows={8}
                  className={fieldClass}
                  placeholder="Enter the chapter text..."
                />
              </div>
            ))}
          </section>

          <section className="border-t border-[#E4DED5] pt-6">
            <h3 className="font-serif text-2xl">Reading Settings</h3>

            <div className="mt-4">
              <label htmlFor="readingDirection" className="font-medium">
                Text Direction
              </label>
              <select
                id="readingDirection"
                name="readingDirection"
                value={form.readingDirection}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="rtl">Right to left (Urdu)</option>
                <option value="ltr">Left to right (English/Hindi)</option>
              </select>
            </div>

            <div className="mt-4">
              <label htmlFor="accessType" className="font-medium">
                Book Access
              </label>
              <select
                id="accessType"
                name="accessType"
                value={form.accessType}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="free">Free</option>
                <option value="membership">Membership required</option>
              </select>
              <p className="mt-2 text-xs leading-5 text-[#696963]">
                Selecting membership does not activate payment enforcement by
                itself; that requires a separate access-control implementation.
              </p>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-[#E1E9DE] p-4">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    isPublished: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 accent-[#34443B]"
              />
              <span>
                <span className="block font-medium">Publish this book</span>
                <span className="mt-1 block text-sm text-[#696963]">
                  Published books are intended to be available on the reading
                  page. Uncheck to keep this book as a draft.
                </span>
              </span>
            </label>
          </section>

          {message && (
            <p role="status" className="rounded-xl bg-[#DCE9DC] p-3 text-sm text-[#315B3B]">
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-[#F1DDE1] p-3 text-sm text-[#874554]">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#34443B] px-5 py-3 font-medium text-white transition hover:bg-[#526B56] disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Book"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-[#E4DED5] px-5 py-3 hover:bg-[#F8F5F0]"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#9A6575]">
                Your library
              </p>
              <h2 className="mt-2 font-serif text-3xl">Saved Books</h2>
            </div>
            <span className="rounded-full bg-[#E1E9DE] px-4 py-2 text-sm">
              {books.length} {books.length === 1 ? "book" : "books"}
            </span>
          </div>

          {fetching ? (
            <p className="py-10 text-center text-[#696963]">Loading books...</p>
          ) : books.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#D8D2C8] p-10 text-center">
              <p className="font-serif text-xl">Your collection starts here</p>
              <p className="mt-2 text-sm text-[#696963]">
                Add your first book using the form above.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {books.map((book, index) => (
                <article
                  key={book._id}
                  className="flex gap-4 rounded-2xl border border-[#E4DED5] bg-[#FFFEFC] p-4 shadow-sm sm:p-5"
                >
                  <div
                    className={`flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                      ["bg-[#E1E9DE]", "bg-[#F0DFE4]", "bg-[#E9E3F2]"][index % 3]
                    }`}
                  >
                    {book.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.coverImage}
                        alt={`Cover of ${book.title}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-2 text-center font-serif text-3xl">
                        ادب
                      </span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A6575]">
                      {book.language || "Urdu"}
                    </span>
                    <h3 className="mt-2 break-words font-serif text-xl">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#696963]">
                      {book.author || "Author not specified"}
                    </p>
                    <p className="mt-2 text-xs text-[#696963]">
                      {book.isPublished ? "Published" : "Draft"} ·{" "}
                      {book.accessType === "membership" ? "Membership" : "Free"}
                    </p>
                    <p className="mt-1 text-xs text-[#696963]">
                      {book.chapters?.length || 0} chapters ·{" "}
                      {book.content?.trim() ? "Full text added" : "No full text"}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => startEdit(book)}
                        className="rounded-lg bg-[#E1E9DE] px-3 py-2 text-xs font-medium hover:bg-[#D2DFCE]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(book)}
                        disabled={deletingId === book._id}
                        className="rounded-lg bg-[#F0DFE4] px-3 py-2 text-xs font-medium text-[#874554] hover:bg-[#E9D0D8] disabled:opacity-50"
                      >
                        {deletingId === book._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
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