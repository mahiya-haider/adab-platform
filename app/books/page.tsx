export default function BooksPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">Books</h1>

        <p className="mt-3 text-gray-600">
          Explore books from different writers, poets and literary traditions.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Featured Books",
            "Urdu Literature",
            "Hindi Literature",
            "Classic Books",
          ].map((book) => (
            <div
              key={book}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex h-48 items-center justify-center rounded-xl bg-gray-100">
                Book Cover
              </div>

              <h2 className="text-xl font-semibold">{book}</h2>

              <p className="mt-2 text-sm text-gray-600">
                Explore this collection and discover literary works.
              </p>

              <button className="mt-5 rounded-lg bg-black px-4 py-2 text-sm text-white">
                View Books
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}