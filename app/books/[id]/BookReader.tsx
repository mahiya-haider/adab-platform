
"use client";

import { useEffect, useMemo, useState } from "react";

type Chapter = {
  _id: string;
  title: string;
  content: string;
  order: number;
};

type ReaderLanguage = "english" | "hindi" | "urdu" | "roman";

type ReaderProps = {
  title: string;
  author: string;
  description: string;
  language: string;
  direction: "ltr" | "rtl";
  content: string;
  chapters: Chapter[];
};

const labels = {
  english: {
    back: "← Back to Books",
    page: "Page",
    of: "of",
    previous: "← Previous",
    next: "Next →",
    font: "Text size",
    smaller: "A−",
    larger: "A+",
    contents: "Book contents",
    unavailable: "Reading content is not available yet.",
    unavailableText:
      "This book is listed in the catalogue, but readable text has not been added yet.",
    start: "Start of book",
    end: "End of available text",
    language: "Reader language",
  },
  hindi: {
    back: "← किताबों पर वापस जाएँ",
    page: "पृष्ठ",
    of: "में से",
    previous: "← पिछला",
    next: "अगला →",
    font: "टेक्स्ट का आकार",
    smaller: "A−",
    larger: "A+",
    contents: "पुस्तक की सामग्री",
    unavailable: "पढ़ने के लिए टेक्स्ट उपलब्ध नहीं है।",
    unavailableText:
      "यह पुस्तक सूची में है, लेकिन इसका पढ़ने योग्य टेक्स्ट अभी उपलब्ध नहीं है।",
    start: "पुस्तक की शुरुआत",
    end: "उपलब्ध टेक्स्ट का अंत",
    language: "रीडर की भाषा",
  },
  urdu: {
    back: "کتابوں پر واپس جائیں ←",
    page: "صفحہ",
    of: "میں سے",
    previous: "← پچھلا",
    next: "اگلا →",
    font: "متن کا سائز",
    smaller: "A−",
    larger: "A+",
    contents: "کتاب کا متن",
    unavailable: "مطالعے کے لیے متن دستیاب نہیں ہے۔",
    unavailableText:
      "یہ کتاب فہرست میں موجود ہے، لیکن اس کا پڑھنے کے قابل متن دستیاب نہیں ہے۔",
    start: "کتاب کا آغاز",
    end: "دستیاب متن کا اختتام",
    language: "مطالعے کی زبان",
  },
  roman: {
    back: "← Books par wapas jaayein",
    page: "Page",
    of: "mein se",
    previous: "← Pichhla",
    next: "Agla →",
    font: "Text ka size",
    smaller: "A−",
    larger: "A+",
    contents: "Kitab ka matn",
    unavailable: "Padhne ke liye text available nahi hai.",
    unavailableText:
      "Kitab catalogue mein hai, lekin iska readable text abhi available nahi hai.",
    start: "Kitab ki shuruaat",
    end: "Available text ka aakhri hissa",
    language: "Reader ki language",
  },
} as const;

type ReaderBlock = {
  title?: string;
  text: string;
};

function makePages(blocks: ReaderBlock[], limit = 1800) {
  const pages: ReaderBlock[][] = [];
  let currentPage: ReaderBlock[] = [];
  let currentLength = 0;

  function finishPage() {
    if (currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentLength = 0;
    }
  }

  for (const block of blocks) {
    if (!block.text.trim()) {
      if (block.title) {
        if (currentLength > 0) finishPage();
        currentPage.push({ title: block.title, text: "" });
        currentLength = block.title.length;
      }
      continue;
    }

    let headingPending = Boolean(block.title);

    for (const paragraph of block.text.split(/\n+/)) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      for (let i = 0; i < trimmed.length; i += limit) {
        const piece = trimmed.slice(i, i + limit);
        const heading = headingPending ? block.title : undefined;
        const requiredLength = piece.length + (heading?.length || 0);

        if (currentLength > 0 && currentLength + requiredLength > limit) {
          finishPage();
        }

        currentPage.push({ title: heading, text: piece });
        currentLength += requiredLength;
        headingPending = false;
      }
    }
  }

  finishPage();
  return pages;
}

export default function BookReader({
  title,
  author,
  description,
  language,
  direction,
  content,
  chapters,
}: ReaderProps) {
  const [page, setPage] = useState(0);
  const [fontSize, setFontSize] = useState(21);
  const [readerLanguage, setReaderLanguage] =
    useState<ReaderLanguage>("english");

  useEffect(() => {
    function readLanguage() {
      const saved = localStorage.getItem("adab-language")?.toLowerCase();

      const mapping: Record<string, ReaderLanguage> = {
        english: "english",
        en: "english",
        hindi: "hindi",
        hi: "hindi",
        urdu: "urdu",
        ur: "urdu",
        roman: "roman",
        "roman urdu": "roman",
      };

      setReaderLanguage(mapping[saved || ""] || "english");
    }

    readLanguage();
    window.addEventListener("storage", readLanguage);
    window.addEventListener("adab-language-change", readLanguage);

    return () => {
      window.removeEventListener("storage", readLanguage);
      window.removeEventListener("adab-language-change", readLanguage);
    };
  }, []);

  // Urdu script is RTL. Roman Urdu and English/Hindi transliteration are LTR.
  const textDirection: "ltr" | "rtl" =
    readerLanguage === "urdu"
      ? "rtl"
      : readerLanguage === "roman"
        ? "ltr"
        : direction;

  const textBlocks = useMemo<ReaderBlock[]>(() => {
    const blocks: ReaderBlock[] = [];

    if (content.trim()) {
      blocks.push({ text: content.trim() });
    }

    for (const chapter of [...chapters].sort(
      (a, b) => a.order - b.order
    )) {
      if (chapter.content?.trim()) {
        blocks.push({
          title: chapter.title,
          text: chapter.content.trim(),
        });
      } else if (chapter.title?.trim()) {
        blocks.push({
          title: chapter.title.trim(),
          text: "",
        });
      }
    }

    if (blocks.length === 0 && description.trim()) {
      blocks.push({ text: description.trim() });
    }

    return blocks;
  }, [content, chapters, description]);

  const pages = useMemo(() => makePages(textBlocks), [textBlocks]);
  const t = labels[readerLanguage];
  const currentPage = pages[page] || [];

  useEffect(() => {
    setPage(0);
  }, [title]);

  function changePage(nextPage: number) {
    setPage(Math.max(0, Math.min(nextPage, pages.length - 1)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-6 text-[#34443b] sm:px-8 sm:py-10">
      <article className="mx-auto max-w-3xl">
        <a
          href="/books"
          className="text-sm text-[#667969] underline underline-offset-4"
        >
          {t.back}
        </a>

        <header className="mt-7 border-b border-[#e8e0d5] pb-6">
          <p className="text-sm text-[#667969]">
            {language || "Literature"}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-gray-600">{author}</p>
        </header>

        <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e8e0d5] bg-white p-4">
          <label className="flex items-center gap-2 text-sm">
            {t.language}
            <select
              value={readerLanguage}
              onChange={(event) =>
                setReaderLanguage(event.target.value as ReaderLanguage)
              }
              className="rounded-lg border border-[#d8d2c8] bg-white p-2"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="urdu">اردو</option>
              <option value="roman">Roman Urdu</option>
            </select>
          </label>

          <div className="flex items-center gap-3">
            <span className="text-sm">{t.font}</span>
            <button
              type="button"
              aria-label="Decrease text size"
              disabled={fontSize <= 15}
              onClick={() => setFontSize((size) => Math.max(15, size - 2))}
              className="rounded-lg border border-[#d8d2c8] px-3 py-2 disabled:opacity-40"
            >
              {t.smaller}
            </button>
            <button
              type="button"
              aria-label="Increase text size"
              disabled={fontSize >= 33}
              onClick={() => setFontSize((size) => Math.min(33, size + 2))}
              className="rounded-lg border border-[#d8d2c8] px-3 py-2 disabled:opacity-40"
            >
              {t.larger}
            </button>
          </div>
        </section>

        {pages.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-[#e8e0d5] bg-white p-6">
            <h2 className="font-serif text-2xl font-semibold">
              {t.unavailable}
            </h2>
            <p className="mt-3 leading-7 text-gray-600">
              {t.unavailableText}
            </p>
          </section>
        ) : (
          <>
            <div className="mt-5 flex items-center justify-between text-sm text-gray-600">
              <span>{page === 0 ? t.start : `${t.page} ${page + 1}`}</span>
              <span>
                {page + 1} {t.of} {pages.length}
              </span>
            </div>

            <section
              dir={textDirection}
              lang={
                readerLanguage === "hindi"
                  ? "hi"
                  : readerLanguage === "urdu"
                    ? "ur"
                    : "en"
              }
              className="mt-3 min-h-[55vh] rounded-xl border border-[#e8e0d5] bg-[#fffdf8] px-6 py-8 shadow-sm sm:px-10 sm:py-12"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.9,
                textAlign: textDirection === "rtl" ? "right" : "left",
                fontFamily:
                  textDirection === "rtl"
                    ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif'
                    : "Georgia, serif",
              }}
            >
              {currentPage.map((block, index) => (
                <div key={`${page}-${index}`} className="mb-6">
                  {block.title && (
                    <h2 className="mb-4 text-2xl font-bold">
                      {block.title}
                    </h2>
                  )}
                  {block.text && (
                    <p className="whitespace-pre-wrap break-words">
                      {block.text}
                    </p>
                  )}
                </div>
              ))}
            </section>

            <nav
              aria-label="Book pages"
              className="mt-5 flex items-center justify-between gap-3"
            >
              <button
                type="button"
                onClick={() => changePage(page - 1)}
                disabled={page === 0}
                className="rounded-xl border border-[#d8d2c8] px-4 py-3 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.previous}
              </button>

              <span className="text-sm text-gray-600">
                {page + 1} / {pages.length}
              </span>

              <button
                type="button"
                onClick={() => changePage(page + 1)}
                disabled={page >= pages.length - 1}
                className="rounded-xl bg-[#34443b] px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.next}
              </button>
            </nav>

            {page === pages.length - 1 && (
              <p className="mt-5 text-center text-sm text-gray-500">
                {t.end}
              </p>
            )}
          </>
        )}
      </article>
    </main>
  );
}
