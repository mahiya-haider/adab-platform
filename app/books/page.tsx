
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Book = {
  _id: string;
  title: string;
  author?: string;
  description?: string;
  coverImage?: string;
  language?: string;
};

type ExternalBook = {
  id: string;
  title: string;
  author: string;
  year: number | null;
  coverImage: string;
  language: string;
  languageCodes?: string[];
  ebookAccess?: string;
  hasFullText?: boolean;
  openLibraryUrl?: string;
  workUrl?: string;
  archiveUrl?: string;
  readingUrl?: string;
};

type LanguageFilter = "all" | "english" | "hindi" | "urdu" | "roman";

function BookCover({
  src,
  title,
}: {
  src?: string;
  title: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl bg-[#eee9df]">
      {src && !failed ? (
        <img
          src={src}
          alt={`Cover of ${title}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-5 text-center text-[#34443b]">
          <span className="text-4xl" aria-hidden="true">
            📚
          </span>
          <span className="font-serif text-lg font-semibold">{title}</span>
          <span className="text-xs text-gray-500">Cover unavailable</span>
        </div>
      )}
    </div>
  );
}

function filterByLanguage(
  books: ExternalBook[],
  language: LanguageFilter
): ExternalBook[] {
  if (language === "all" || language === "roman") {
    return books;
  }

  const codes: Record<"english" | "hindi" | "urdu", string> = {
    english: "eng",
    hindi: "hin",
    urdu: "urd",
  };

  const target = codes[language];

  return books.filter((book) =>
    (book.languageCodes || []).some(
      (code) => code.toLowerCase() === target
    )
  );
}

function getAccessMessage(book: ExternalBook): string {
  switch (book.ebookAccess) {
    case "borrowable":
      return "Borrowing or an account may be required to read this edition.";

    case "printdisabled":
      return "Access may be restricted to eligible readers. Check the source website.";

    case "no_ebook":
      return "A digital reading copy may not be available for this edition.";

    default:
      return "Reading availability depends on the edition and its access terms.";
  }
}

export default function BooksPage() {
  const [localBooks, setLocalBooks] = useState<Book[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState("");

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageFilter>("all");

  const [externalBooks, setExternalBooks] = useState<ExternalBook[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);

  const requestId = useRef(0);

  useEffect(() => {
    let active = true;

    async function fetchLocalBooks() {
      try {
        const response = await fetch("/api/books", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Failed to load saved books.");
        }

        if (active) {
          setLocalBooks(Array.isArray(data.books) ? data.books : []);
        }
      } catch {
        if (active) {
          setLocalError("Unable to load your saved books. Please try again.");
        }
      } finally {
        if (active) setLocalLoading(false);
      }
    }

    void fetchLocalBooks();

    return () => {
      active = false;
    };
  }, []);

  const searchBooks = useCallback(
    async (
      searchTerm: string,
      nextPage: number,
      append: boolean,
      language: LanguageFilter
    ) => {
      const currentRequest = ++requestId.current;

      setSearchLoading(true);
      setSearchError("");

      try {
        const params = new URLSearchParams({
          q: searchTerm,
          page: String(nextPage),
        });

        if (language === "english") params.set("language", "eng");
        if (language === "hindi") params.set("language", "hin");
        if (language === "urdu") params.set("language", "urd");

        // Roman Urdu cannot be reliably identified as a separate
        // language in the external catalogue.

        const response = await fetch(
          `/api/books/search?${params.toString()}`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to search the book catalogue."
          );
        }

        if (currentRequest !== requestId.current) return;

        const rawBooks: ExternalBook[] = Array.isArray(data.books)
          ? data.books
          : [];

        const results = filterByLanguage(rawBooks, language);

        setExternalBooks((previous) =>
          append ? [...previous, ...results] : results
        );

        setTotal(Number(data.total) || 0);
        setPage(nextPage);
      } catch (error) {
        if (currentRequest !== requestId.current) return;

        setSearchError(
          error instanceof Error
            ? error.message
            : "Unable to search books. Please try again."
        );

        if (!append) {
          setExternalBooks([]);
          setTotal(0);
        }
      } finally {
        if (currentRequest === requestId.current) {
          setSearchLoading(false);
        }
      }
    },
    []
  );

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = query.trim();

    if (term.length < 2) {
      setSearchError("Please enter at least 2 characters.");
      return;
    }

    setSubmittedQuery(term);
    setSearched(true);
    setPage(1);
    setExternalBooks([]);
    setTotal(0);

    void searchBooks(term, 1, false, selectedLanguage);
  }

  function handleLanguageChange(language: LanguageFilter) {
    setSelectedLanguage(language);
    setExternalBooks([]);
    setPage(1);
    setTotal(0);
    setSearchError("");

    if (submittedQuery) {
      void searchBooks(submittedQuery, 1, false, language);
    }
  }

  function loadMore() {
    if (!submittedQuery || searchLoading) return;

    void searchBooks(
      submittedQuery,
      page + 1,
      true,
      selectedLanguage
    );
  }

  const hasMore = externalBooks.length > 0 && page * 20 < total;

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-5 py-12 text-[#34443b] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#667969]">
            Discover literature
          </p>

          <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
            Books
          </h1>

          <p className="mt-4 max-w-2xl text-gray-600">
            Explore books from different writers, poets, languages and
            literary traditions around the world.
          </p>
        </header>

        <section className="mt-10 rounded-2xl border border-[#e8e0d5] bg-white p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold">
            Search the worldwide catalogue
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Search by book title or author using Open Library.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Deewan-e-Ghalib or Jane Austen"
              aria-label="Search books by title or author"
              minLength={2}
              className="min-w-0 flex-1 rounded-xl border border-[#d8d2c8] bg-[#fdfcf9] px-4 py-3 outline-none focus:border-[#667969] focus:ring-2 focus:ring-[#e1e9de]"
            />

            <button
              type="submit"
              disabled={searchLoading}
              className="rounded-xl bg-[#34443b] px-6 py-3 font-medium text-white transition hover:bg-[#455a4d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searchLoading ? "Searching..." : "Search Books"}
            </button>
          </form>

          <div className="mt-4 max-w-sm">
            <label
              htmlFor="book-language"
              className="mb-2 block text-sm font-medium"
            >
              Filter by book language
            </label>

            <select
              id="book-language"
              value={selectedLanguage}
              onChange={(event) =>
                handleLanguageChange(event.target.value as LanguageFilter)
              }
              className="w-full rounded-xl border border-[#d8d2c8] bg-[#fdfcf9] px-4 py-3 outline-none focus:border-[#667969] focus:ring-2 focus:ring-[#e1e9de]"
            >
              <option value="all">All languages</option>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="urdu">Urdu</option>
              <option value="roman">Roman Urdu</option>
            </select>

            {selectedLanguage === "roman" && (
              <p className="mt-2 text-xs text-gray-500">
                Roman Urdu editions may not be separately identified in
                the external catalogue. Results are not guaranteed to be
                exclusively Roman Urdu.
              </p>
            )}
          </div>

          {searchError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {searchError}
            </p>
          )}

          {searched && !searchLoading && !searchError && (
            <p className="mt-4 text-sm text-gray-600">
              {externalBooks.length} books displayed from the current
              catalogue pages. The total catalogue count is{" "}
              {total.toLocaleString()} and may include other editions or
              language records.
            </p>
          )}

          {searched && externalBooks.length > 0 && (
            <div className="mt-7">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {externalBooks.map((book, index) => (
                  <article
                    key={`${book.id}-${index}`}
                    className="flex flex-col rounded-2xl border border-[#e8e0d5] bg-[#fdfcf9] p-4"
                  >
                    <BookCover src={book.coverImage} title={book.title} />

                    <h3 className="mt-4 font-serif text-lg font-semibold">
                      {book.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                      {book.author}
                    </p>

                    {book.year && (
                      <p className="mt-2 text-xs text-gray-500">
                        First published: {book.year}
                      </p>
                    )}

                    {book.language && (
                      <p className="mt-1 text-xs text-gray-500">
                        Original catalogue language: {book.language}
                      </p>
                    )}

                    <p className="mt-3 text-xs text-gray-500">
                      External catalogue · Not yet saved to Adab
                    </p>

                    <div className="mt-auto space-y-2 pt-4">
                      {book.ebookAccess === "borrowable" ||
                      book.ebookAccess === "printdisabled" ? (
                        <>
                          <a
                            href={
                              book.openLibraryUrl ||
                              book.archiveUrl ||
                              undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl border border-[#34443b] px-4 py-3 text-center text-sm font-medium transition hover:bg-[#e1e9de]"
                          >
                            View Book Access ↗
                          </a>

                          <p className="text-xs leading-5 text-gray-600">
                            {getAccessMessage(book)}
                          </p>
                        </>
                      ) : book.ebookAccess === "public" &&
                        book.hasFullText &&
                        book.readingUrl ? (
                        <>
                          <a
                            href={book.readingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl bg-[#34443b] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#455a4d]"
                          >
                            Open Reading Source ↗
                          </a>

                          <p className="text-xs leading-5 text-gray-600">
                            Confirm that the complete text is available
                            on the source website.
                          </p>
                        </>
                      ) : book.openLibraryUrl ? (
                        <>
                          <a
                            href={book.openLibraryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl border border-[#34443b] px-4 py-3 text-center text-sm font-medium transition hover:bg-[#e1e9de]"
                          >
                            View Catalogue ↗
                          </a>

                          <p className="text-xs leading-5 text-gray-600">
                            {getAccessMessage(book)}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500">
                          No catalogue link available.
                        </p>
                      )}

                      {book.workUrl && (
                        <a
                          href={`${book.workUrl}#related-work-carousel`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl border border-[#34443b] px-4 py-3 text-center text-sm font-medium transition hover:bg-[#e1e9de]"
                        >
                          Find Available Editions →
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={searchLoading}
                    className="rounded-xl border border-[#34443b] px-6 py-3 font-medium transition hover:bg-[#e1e9de] disabled:opacity-60"
                  >
                    {searchLoading ? "Loading..." : "Load More Books"}
                  </button>
                </div>
              )}
            </div>
          )}

          {searched &&
            !searchLoading &&
            !searchError &&
            externalBooks.length === 0 && (
              <p className="mt-6 text-gray-600">
                No matching books were found for this search and language.
                Try another title or select All languages.
              </p>
            )}
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl font-bold">
            Books on Adab Platform
          </h2>

          <p className="mt-2 text-gray-600">
            Explore and read books published in our own catalogue.
          </p>

          {localLoading ? (
            <p className="mt-8 text-gray-600">Loading saved books...</p>
          ) : localError ? (
            <p role="alert" className="mt-8 text-red-600">
              {localError}
            </p>
          ) : localBooks.length === 0 ? (
            <p className="mt-8 text-gray-600">
              No published books are available yet.
            </p>
          ) : (
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {localBooks.map((book) => (
                <article
                  key={book._id}
                  className="flex flex-col rounded-2xl border border-[#e8e0d5] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <BookCover src={book.coverImage} title={book.title} />

                  <h3 className="mt-4 font-serif text-xl font-semibold">
                    {book.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-600">
                    {book.author || "Author not specified"}
                  </p>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                    {book.description || "No description available."}
                  </p>

                  <p className="mt-3 text-xs text-gray-500">
                    Language: {book.language || "Not specified"}
                  </p>

                  <div className="mt-auto pt-5">
                    <Link
                      href={`/books/${book._id}`}
                      className="block rounded-xl bg-[#34443b] px-5 py-3 text-center font-medium text-white transition hover:bg-[#455a4d] focus:outline-none focus:ring-2 focus:ring-[#667969] focus:ring-offset-2"
                    >
                      Read Book →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-12 text-center text-xs leading-5 text-gray-500">
          Worldwide search results are provided by Open Library. Catalogue
          coverage, language metadata and cover availability vary by book
          and edition. Reading restrictions are determined by the source.
        </p>
      </div>
    </main>
  );
}

