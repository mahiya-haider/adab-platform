"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Poet = {
  _id: string;
  name: string;
  penName?: string;
  biography?: string;
  profileImage?: string;
  type?: string;
  language?: string;
};

type ExternalPoet = {
  id: string;
  name: string;
  alternateNames: string[];
  birthDate: string;
  deathDate: string;
  topWork: string;
  workCount: number;
  photoId: number | null;
  source: string;
};

function PoetAvatar({
  src,
  name,
  searchFallback = false,
}: {
  src?: string;
  name: string;
  searchFallback?: boolean;
}) {
  const [imageSrc, setImageSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setFailed(false);
    setFallbackAttempted(false);
  }, [src]);

  async function handleImageError() {
    if (searchFallback && !fallbackAttempted) {
      setFallbackAttempted(true);
      setFailed(true);

      try {
        const response = await fetch(
          `/api/poets/images?name=${encodeURIComponent(name)}`
        );
        const data = await response.json();

        if (response.ok && data.success && data.image) {
          setImageSrc(data.image);
          setFailed(false);
          return;
        }
      } catch (error) {
        console.error("Poet image request failed:", error);
      }
    }

    setFailed(true);
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e1e9de]">
      {imageSrc && !failed ? (
        <img
          src={imageSrc}
          alt={`Portrait of ${name}`}
          loading="lazy"
          onError={() => void handleImageError()}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-serif text-2xl font-semibold text-[#34443b]">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default function PoetsPage() {
  const [poets, setPoets] = useState<Poet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [externalPoets, setExternalPoets] = useState<ExternalPoet[]>([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searched, setSearched] = useState(false);

  const requestId = useRef(0);

  useEffect(() => {
    let active = true;

    async function fetchPoets() {
      try {
        const response = await fetch("/api/poets", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Failed to load poets.");
        }

        if (active) {
          setPoets(Array.isArray(data.poets) ? data.poets : []);
        }
      } catch {
        if (active) {
          setError("Unable to load saved poets. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchPoets();

    return () => {
      active = false;
    };
  }, []);

  const searchExternalPoets = useCallback(
    async (term: string, nextPage: number, append: boolean) => {
      const currentRequest = ++requestId.current;
      setExternalLoading(true);
      setExternalError("");

      try {
        const params = new URLSearchParams({
          q: term,
          page: String(nextPage),
        });

        const response = await fetch(
          `/api/poets/search?${params.toString()}`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to search the poet catalogue."
          );
        }

        if (currentRequest !== requestId.current) return;

        const results: ExternalPoet[] = Array.isArray(data.poets)
          ? data.poets
          : [];

        setExternalPoets((previous) =>
          append ? [...previous, ...results] : results
        );
        setTotal(Number(data.total) || 0);
        setPage(nextPage);
      } catch (err) {
        if (currentRequest !== requestId.current) return;

        setExternalError(
          err instanceof Error
            ? err.message
            : "Unable to search poets. Please try again."
        );

        if (!append) setExternalPoets([]);
      } finally {
        if (currentRequest === requestId.current) {
          setExternalLoading(false);
        }
      }
    },
    []
  );

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = query.trim();

    if (term.length < 2) {
      setExternalError("Please enter at least 2 characters.");
      return;
    }

    setSubmittedQuery(term);
    setSearched(true);
    setExternalPoets([]);
    setPage(1);
    void searchExternalPoets(term, 1, false);
  }

  function loadMore() {
    if (!submittedQuery || externalLoading) return;
    void searchExternalPoets(submittedQuery, page + 1, true);
  }

  const hasMore = externalPoets.length < total;

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-5 py-12 text-[#34443b] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#667969]">
            Literary voices
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
            Poets
          </h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Discover poets, explore their lives, and find writers from literary
            traditions around the world.
          </p>
        </header>

        <section className="mt-10 rounded-2xl border border-[#e8e0d5] bg-white p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold">
            Search the poet catalogue
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Search poets and authors by name using Open Library records.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Mirza Ghalib or Rabindranath Tagore"
              aria-label="Search poets and authors"
              minLength={2}
              className="min-w-0 flex-1 rounded-xl border border-[#d8d2c8] bg-[#fdfcf9] px-4 py-3 outline-none focus:border-[#667969] focus:ring-2 focus:ring-[#e1e9de]"
            />
            <button
              type="submit"
              disabled={externalLoading}
              className="rounded-xl bg-[#34443b] px-6 py-3 font-medium text-white transition hover:bg-[#455a4d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {externalLoading ? "Searching..." : "Search Poets"}
            </button>
          </form>

          {externalError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {externalError}
            </p>
          )}

          {searched && !externalLoading && !externalError && (
            <p className="mt-4 text-sm text-gray-600">
              Found {total.toLocaleString()} matching catalogue records.
              Results may include authors who are not poets.
            </p>
          )}

          {searched && externalPoets.length > 0 && (
            <div className="mt-7">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {externalPoets.map((poet, index) => (
                  <article
                    key={`${poet.id}-${index}`}
                    className="rounded-2xl border border-[#e8e0d5] bg-[#fdfcf9] p-5"
                  >
                    <div className="flex items-start gap-4">
                      <PoetAvatar
                        src={
                          poet.photoId
                            ? `https://covers.openlibrary.org/a/id/${poet.photoId}-M.jpg`
                            : undefined
                        }
                        name={poet.name}
                        searchFallback={true}
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-serif text-xl font-semibold">
                          {poet.name}
                        </h3>
                        {(poet.birthDate || poet.deathDate) && (
                          <p className="mt-1 text-sm text-gray-500">
                            {poet.birthDate || "Unknown"} –{" "}
                            {poet.deathDate || "Unknown"}
                          </p>
                        )}
                      </div>
                    </div>

                    {poet.alternateNames.length > 0 && (
                      <p className="mt-4 break-words text-sm text-gray-600">
                        Also known as:{" "}
                        {poet.alternateNames.slice(0, 3).join(", ")}
                      </p>
                    )}

                    {poet.topWork && (
                      <p className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Notable work:</span>{" "}
                        {poet.topWork}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-gray-500">
                      {poet.workCount} catalogue works · {poet.source}
                    </p>

                    <a
                      href={`https://openlibrary.org/authors/${encodeURIComponent(
                        poet.id.replace(/^\/?authors\//, "")
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-sm font-medium text-[#526b58] underline underline-offset-4 hover:text-[#34443b]"
                    >
                      View catalogue record
                    </a>
                  </article>
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={externalLoading}
                    className="rounded-xl border border-[#34443b] px-6 py-3 font-medium transition hover:bg-[#e1e9de] disabled:opacity-60"
                  >
                    {externalLoading ? "Loading..." : "Load More Poets"}
                  </button>
                </div>
              )}

              {!hasMore && (
                <p className="mt-6 text-center text-sm text-gray-500">
                  You have reached the end of these search results.
                </p>
              )}
            </div>
          )}

          {searched &&
            !externalLoading &&
            !externalError &&
            externalPoets.length === 0 && (
              <p className="mt-6 text-gray-600">
                No matching records were found. Try another name.
              </p>
            )}

          <p className="mt-6 text-xs leading-5 text-gray-500">
            External search results come from Open Library. Catalogue records
            may be incomplete and do not guarantee that every person is a poet.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl font-bold">
            Poets on Adab Platform
          </h2>
          <p className="mt-2 text-gray-600">
            Poets and authors saved in our own catalogue.
          </p>

          {loading ? (
            <p className="mt-8 text-gray-600">Loading saved poets...</p>
          ) : error ? (
            <p role="alert" className="mt-8 text-red-600">
              {error}
            </p>
          ) : poets.length === 0 ? (
            <p className="mt-8 text-gray-600">
              No poets have been added to the Adab catalogue yet.
            </p>
          ) : (
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {poets.map((poet) => (
                <article
                  key={poet._id}
                  className="rounded-2xl border border-[#e8e0d5] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <PoetAvatar src={poet.profileImage} name={poet.name} />
                    <div className="min-w-0">
                      <h3 className="break-words font-serif text-xl font-semibold">
                        {poet.name}
                      </h3>
                      {poet.penName && (
                        <p className="text-sm text-gray-500">
                          {poet.penName}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {poet.type === "both"
                          ? "Poet & Author"
                          : poet.type === "author"
                            ? "Author"
                            : "Poet"}
                      </p>
                    </div>
                  </div>

                  {poet.biography && (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {poet.biography}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-500">
                    Language: {poet.language || "Not specified"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
