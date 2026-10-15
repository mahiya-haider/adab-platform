"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type SuggestionStatus = "pending" | "approved" | "rejected";

type Suggestion = {
_id: string;
bookTitle: string;
authorName?: string;
reason?: string;
suggestedBy?: string;
status: SuggestionStatus;
createdAt?: string;
};

type StatusFilter = "all" | SuggestionStatus;

const statusStyles: Record<SuggestionStatus, string> = {
pending: "bg-[#F5EAD1] text-[#806329]",
approved: "bg-[#DCE9DC] text-[#315B3B]",
rejected: "bg-[#F1DDE1] text-[#874554]",
};

export default function AdminSuggestionsPage() {
const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState("");
const [notice, setNotice] = useState("");
const [updatingId, setUpdatingId] = useState("");
const [search, setSearch] = useState("");
const [filter, setFilter] = useState<StatusFilter>("all");
const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

const loadSuggestions = useCallback(async (manual = false) => {
if (manual) setRefreshing(true);
else setLoading(true);

setError("");
setNotice("");

try {
  const response = await fetch("/api/suggestions", {
    cache: "no-store",
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Unable to load book suggestions."
    );
  }

  setSuggestions(data.suggestions ?? []);
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to load book suggestions. Please try again."
  );
} finally {
  setLoading(false);
  setRefreshing(false);
}

}, []);

useEffect(() => {
void loadSuggestions();
}, [loadSuggestions]);

const counts = useMemo(
() => ({
all: suggestions.length,
pending: suggestions.filter((item) => item.status === "pending").length,
approved: suggestions.filter((item) => item.status === "approved").length,
rejected: suggestions.filter((item) => item.status === "rejected").length,
}),
[suggestions]
);

const filteredSuggestions = useMemo(() => {
const query = search.trim().toLowerCase();

return suggestions
  .filter((item) => {
    const matchesFilter =
      filter === "all" || item.status === filter;

    const searchableText = [
      item.bookTitle,
      item.authorName,
      item.suggestedBy,
      item.reason,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesFilter && searchableText.includes(query);
  })
  .sort((a, b) => {
    const dateA = a.createdAt
      ? new Date(a.createdAt).getTime()
      : 0;
    const dateB = b.createdAt
      ? new Date(b.createdAt).getTime()
      : 0;

    return sortOrder === "newest"
      ? dateB - dateA
      : dateA - dateB;
  });

}, [suggestions, search, filter, sortOrder]);

async function updateStatus(
suggestion: Suggestion,
nextStatus: "approved" | "rejected"
) {
if (updatingId) return;

const action = nextStatus === "approved" ? "approve" : "reject";

const confirmed = window.confirm(
  `Are you sure you want to ${action} "${suggestion.bookTitle}"?\n\n` +
    `Current status: ${suggestion.status}\n` +
    `New status: ${nextStatus}\n\n` +
    "You can change this decision later."
);

if (!confirmed) return;

setUpdatingId(suggestion._id);
setError("");
setNotice("");

try {
  const response = await fetch(
    `/api/suggestions/${suggestion._id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Unable to update suggestion."
    );
  }

  setSuggestions((current) =>
    current.map((item) =>
      item._id === suggestion._id
        ? { ...item, status: data.suggestion?.status ?? nextStatus }
        : item
    )
  );

  setNotice(
    `"${suggestion.bookTitle}" is now ${nextStatus}.`
  );
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to update suggestion. Please try again."
  );
} finally {
  setUpdatingId("");
}

}

function formatDate(value?: string) {
if (!value) return "Date unavailable";

const date = new Date(value);

if (Number.isNaN(date.getTime())) return "Date unavailable";

return new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(date);

}

const filterOptions: { value: StatusFilter; label: string }[] = [
{ value: "all", label: "All" },
{ value: "pending", label: "Pending" },
{ value: "approved", label: "Approved" },
{ value: "rejected", label: "Rejected" },
];

return (
<main className="min-h-screen bg-[#F8F5EF] px-4 py-8 text-[#34443B] sm:px-6 sm:py-12">
<div className="mx-auto max-w-6xl">
<header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
<div>
<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#71816D]">
Adab Administration
</p>
<h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
Book Suggestions
</h1>
<p className="mt-3 max-w-2xl text-sm leading-6 text-[#696963] sm:text-base">
Review reader recommendations and manage their approval status.
</p>
</div>

      <button
        type="button"
        onClick={() => void loadSuggestions(true)}
        disabled={loading || refreshing}
        className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#DCD9CE] bg-white px-4 py-3 text-sm font-medium transition hover:bg-[#F1EEE7] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
      >
        <span aria-hidden="true">↻</span>
        {refreshing ? "Refreshing..." : "Refresh"}
      </button>
    </header>

    <section
      aria-label="Suggestion statistics"
      className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
    >
      {[
        { label: "Total", count: counts.all, color: "bg-white" },
        { label: "Pending", count: counts.pending, color: "bg-[#F5EAD1]" },
        { label: "Approved", count: counts.approved, color: "bg-[#DCE9DC]" },
        { label: "Rejected", count: counts.rejected, color: "bg-[#F1DDE1]" },
      ].map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl border border-[#E4DED5] ${item.color} p-4 sm:p-5`}
        >
          <p className="text-sm text-[#696963]">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {item.count}
          </p>
        </div>
      ))}
    </section>

    <section className="mt-7 rounded-2xl border border-[#E4DED5] bg-white p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <div>
          <label
            htmlFor="suggestion-search"
            className="mb-2 block text-sm font-medium"
          >
            Search suggestions
          </label>
          <input
            id="suggestion-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search book, author, submitter or reason..."
            className="w-full rounded-xl border border-[#DDD9CF] bg-[#FDFCF9] px-4 py-3 text-sm outline-none transition placeholder:text-[#99958B] focus:border-[#71816D] focus:ring-2 focus:ring-[#71816D]/20"
          />
        </div>

        <div>
          <label
            htmlFor="suggestion-sort"
            className="mb-2 block text-sm font-medium"
          >
            Sort by date
          </label>
          <select
            id="suggestion-sort"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(event.target.value as "newest" | "oldest")
            }
            className="w-full rounded-xl border border-[#DDD9CF] bg-[#FDFCF9] px-4 py-3 text-sm outline-none focus:border-[#71816D]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter by status">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === option.value
                ? "bg-[#34443B] text-white"
                : "border border-[#E4DED5] bg-white text-[#5F665E] hover:bg-[#F5F2EC]"
            }`}
          >
            {option.label}
            <span className="ml-2 opacity-80">
              {counts[option.value]}
            </span>
          </button>
        ))}
      </div>
    </section>

    {error && (
      <div
        role="alert"
        className="mt-6 rounded-xl border border-[#E3C8CF] bg-[#F8ECEF] p-4 text-sm text-[#874554]"
      >
        <p>{error}</p>
        <button
          type="button"
          onClick={() => void loadSuggestions()}
          className="mt-2 font-semibold underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    )}

    {notice && (
      <div
        role="status"
        className="mt-6 rounded-xl border border-[#D0DFD0] bg-[#EAF2E8] p-4 text-sm text-[#315B3B]"
      >
        {notice}
      </div>
    )}

    {loading ? (
      <div className="mt-8 rounded-2xl border border-[#E4DED5] bg-white p-10 text-center text-[#696963]">
        Loading book suggestions...
      </div>
    ) : !error && filteredSuggestions.length === 0 ? (
      <div className="mt-8 rounded-2xl border border-[#E4DED5] bg-white px-6 py-12 text-center">
        <h2 className="font-serif text-2xl font-semibold">
          {suggestions.length === 0
            ? "No suggestions yet"
            : "No matching suggestions"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#696963]">
          {suggestions.length === 0
            ? "New book recommendations submitted by readers will appear here."
            : "Try a different search term or select another status filter."}
        </p>
        {(search || filter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="mt-5 rounded-xl bg-[#34443B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#26352C]"
          >
            Clear filters
          </button>
        )}
      </div>
    ) : (
      <div className="mt-6 grid gap-4">
        {filteredSuggestions.map((suggestion) => {
          const isUpdating = updatingId === suggestion._id;

          return (
            <article
              key={suggestion._id}
              className="rounded-2xl border border-[#E4DED5] bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8A7F]">
                    Reader recommendation
                  </p>
                  <h2 className="mt-2 break-words font-serif text-xl font-semibold sm:text-2xl">
                    {suggestion.bookTitle}
                  </h2>
                  <p className="mt-2 text-sm text-[#696963]">
                    Author: {suggestion.authorName || "Not provided"}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles[suggestion.status]}`}
                >
                  {suggestion.status}
                </span>
              </div>

              {suggestion.reason && (
                <div className="mt-5 rounded-xl bg-[#F8F5EF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#71816D]">
                    Recommendation note
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-[#4F514B]">
                    {suggestion.reason}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#77776F]">
                <p>
                  Suggested by:{" "}
                  <span className="font-medium text-[#4F514B]">
                    {suggestion.suggestedBy || "Anonymous"}
                  </span>
                </p>
                <p>Submitted: {formatDate(suggestion.createdAt)}</p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#EEE9E1] pt-5">
                {suggestion.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() =>
                      void updateStatus(suggestion, "approved")
                    }
                    disabled={Boolean(updatingId)}
                    className="rounded-xl bg-[#34443B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#26352C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating
                      ? "Updating..."
                      : suggestion.status === "rejected"
                        ? "Change to Approved"
                        : "Approve"}
                  </button>
                )}

                {suggestion.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() =>
                      void updateStatus(suggestion, "rejected")
                    }
                    disabled={Boolean(updatingId)}
                    className="rounded-xl border border-[#E3C8CF] bg-[#F8ECEF] px-4 py-2.5 text-sm font-medium text-[#874554] transition hover:bg-[#F1DDE1] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating
                      ? "Updating..."
                      : suggestion.status === "approved"
                        ? "Change to Rejected"
                        : "Reject"}
                  </button>
                )}

                {suggestion.status !== "pending" && (
                  <span className="text-xs text-[#77776F]">
                    You can change this decision later.
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    )}

    {!loading && !error && filteredSuggestions.length > 0 && (
      <p className="mt-5 text-center text-sm text-[#77776F]">
        Showing {filteredSuggestions.length} of {suggestions.length} suggestions
      </p>
    )}
  </div>
</main>

);
}