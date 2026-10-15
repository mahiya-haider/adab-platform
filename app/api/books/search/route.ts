
import { NextResponse } from "next/server";

type OpenLibraryBook = {
  key?: string;
  work_key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  language?: string[];
  ebook_access?: string;
  has_fulltext?: boolean;
  ia?: string[];
};

function getLanguageName(codes: string[]): string {
  const names: Record<string, string> = {
    eng: "English",
    hin: "Hindi",
    urd: "Urdu",
    ben: "Bengali",
    ara: "Arabic",
    fas: "Persian",
    san: "Sanskrit",
    tam: "Tamil",
    tel: "Telugu",
    mar: "Marathi",
    fra: "French",
    deu: "German",
    spa: "Spanish",
  };

  for (const code of codes) {
    if (names[code]) return names[code];
  }

  return codes[0] || "Not specified";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const requestedPage = Number(searchParams.get("page") || "1");
    const requestedLanguage =
      searchParams.get("language")?.trim().toLowerCase();

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? Math.min(requestedPage, 10000)
        : 1;

    if (query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter at least 2 characters.",
        },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      q: query,
      fields:
        "key,work_key,title,author_name,first_publish_year,cover_i,language,ebook_access,has_fulltext,ia",
      limit: "20",
      page: String(page),
    });

    const allowedLanguages = [
      "eng",
      "hin",
      "urd",
      "ben",
      "ara",
      "fas",
      "san",
      "tam",
      "tel",
      "mar",
      "fra",
      "deu",
      "spa",
    ];

    if (
      requestedLanguage &&
      allowedLanguages.includes(requestedLanguage)
    ) {
      params.set("language", requestedLanguage);
    }

    const response = await fetch(
      `https://openlibrary.org/search.json?${params.toString()}`,
      {
        headers: {
          "User-Agent": "AdabPlatform/1.0",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error("Book catalogue request failed.");
    }

    const data = await response.json();

    const books = (data.docs || []).map(
      (item: OpenLibraryBook) => {
        const openLibraryUrl = item.key
          ? `https://openlibrary.org${item.key}`
          : "";

        const workKey =
          item.work_key?.startsWith("/works/")
            ? item.work_key
            : item.key?.startsWith("/works/")
              ? item.key
              : "";

        const workUrl = workKey
          ? `https://openlibrary.org${workKey}`
          : "";

        const archiveId = item.ia?.[0] || "";

        const archiveUrl = archiveId
          ? `https://archive.org/details/${encodeURIComponent(
              archiveId
            )}`
          : "";

        const languageCodes = item.language || [];
        const ebookAccess = item.ebook_access || "no_ebook";
        const hasFullText = item.has_fulltext === true;

        let accessStatus = "catalogue_only";

        if (ebookAccess === "public") {
          accessStatus = "public_access";
        } else if (ebookAccess === "borrowable") {
          accessStatus = "borrowing_required";
        } else if (ebookAccess === "printdisabled") {
          accessStatus = "restricted_access";
        } else if (ebookAccess === "no_ebook") {
          accessStatus = "no_ebook";
        }

        return {
          id: item.key || "",
          title: item.title || "Untitled",
          author:
            item.author_name?.[0] || "Author not specified",
          year: item.first_publish_year || null,
          coverImage: item.cover_i
            ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
            : "",
          language: getLanguageName(languageCodes),
          languageCodes,
          ebookAccess,
          accessStatus,
          hasFullText,
          openLibraryUrl,
          workUrl,
          archiveUrl,
          readingUrl:
            accessStatus === "public_access" && hasFullText
              ? archiveUrl
              : "",
          pdfAvailable: false,
          pdfUrl: "",
        };
      }
    );

    return NextResponse.json({
      success: true,
      books,
      total: Number(data.numFound) || 0,
      page,
    });
  } catch (error) {
    console.error("Worldwide book search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to search the book catalogue right now.",
      },
      { status: 502 }
    );
  }
}
