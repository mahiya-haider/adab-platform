// app/api/poets/image/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name")?.trim() || "";

    if (name.length < 2) {
      return NextResponse.json(
        { success: false, image: null, title: null },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      action: "query",
      titles: name,
      redirects: "1",
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: "300",
      format: "json",
    });

    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?${params.toString()}`,
      {
        headers: {
          "User-Agent": "AdabPlatform/1.0 (literature catalogue)",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error("Wikipedia image request failed.");
    }

    const data = await response.json();

    const pages = Object.values(
      data.query?.pages || {}
    ) as Array<{
      title?: string;
      missing?: boolean;
      thumbnail?: {
        source?: string;
      };
    }>;

    const matchingPage = pages.find(
      (page) => !page.missing && page.thumbnail?.source
    );

    return NextResponse.json({
      success: true,
      image: matchingPage?.thumbnail?.source || null,
      title: matchingPage?.title || null,
      source: "Wikipedia",
    });
  } catch (error) {
    console.error("Poet image search error:", error);

    return NextResponse.json(
      { success: false, image: null, title: null },
      { status: 502 }
    );
  }
}