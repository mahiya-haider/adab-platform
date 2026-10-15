
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getReaderSession } from "@/lib/auth";
import Book from "@/models/Book";
import User from "@/models/User";
import BookReader from "./BookReader";

type Chapter = {
  _id: string;
  title: string;
  content: string;
  order: number;
};

type BookDocument = {
  _id: { toString(): string };
  title: string;
  author?: string;
  description?: string;
  language?: string;
  content?: string;
  chapters?: Chapter[];
  readingDirection?: "ltr" | "rtl";
  isPublished?: boolean;
  accessType?: "free" | "membership";
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookReadingPage({
  params,
}: PageProps) {
  const { id } = await params;

  if (!/^[a-f\d]{24}$/i.test(id)) {
    notFound();
  }

  await connectDB();

  const result = await Book.findById(id).lean();

  if (!result) {
    notFound();
  }

  const book = result as unknown as BookDocument;

  // Never show unpublished books to readers.
  if (book.isPublished !== true) {
    notFound();
  }

  // Membership-only books require an authenticated reader
  // with an active membership recorded on the server.
  if (book.accessType === "membership") {
    const session = await getReaderSession();

    if (!session) {
      notFound();
    }

    const reader = await User.findById(session.userId)
      .select("membershipStatus membershipExpiresAt")
      .lean();

    if (!reader || reader.membershipStatus !== "active") {
      notFound();
    }

    const expiry = reader.membershipExpiresAt;

    if (expiry && new Date(expiry).getTime() <= Date.now()) {
      notFound();
    }
  }

  const direction =
    book.readingDirection ||
    (book.language === "Urdu" ? "rtl" : "ltr");

  
const chapters = (book.chapters || [])
  .map((chapter) => ({
    _id: String(chapter._id),
    title: String(chapter.title || ""),
    content: String(chapter.content || ""),
    order: Number(chapter.order || 0),
  }))
  .sort((a, b) => a.order - b.order);


  return (
    <BookReader
      title={book.title}
      author={book.author || "Author not specified"}
      description={book.description || ""}
      language={book.language || "Not specified"}
      direction={direction}
      content={book.content || ""}
      chapters={chapters}
    />
  );
}
