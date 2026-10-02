export default function Home() {
  const languages = ["English", "हिंदी", "اردو", "Roman"];

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-gray-900">

      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <h1 className="text-2xl font-bold">Adab</h1>

          <div className="hidden gap-6 md:flex">
            <a href="/books">Books</a>
            <a href="/poets">Poets</a>
            <a href="/authors">Authors</a>
            <a href="/kalaam">Kalaam</a>
            <a href="/articles">Articles</a>
          </div>

          {/* Language Switcher */}
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <button
                key={language}
                className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
              >
                {language}
              </button>
            ))}
          </div>

        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">

        <p className="mb-3 text-sm uppercase tracking-widest text-gray-500">
          Literature • Poetry • Books
        </p>

        <h2 className="text-5xl font-bold leading-tight">
          Discover the world of Adab
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          Explore poets, authors, books, ghazals, kalaam and timeless
          literature in one place.
        </p>

        {/* Search */}
        <div className="mx-auto mt-8 flex max-w-2xl overflow-hidden rounded-xl border bg-white shadow-sm">

          <input
            type="text"
            placeholder="Search poets, books, kalaam..."
            className="flex-1 px-5 py-4 outline-none"
          />

          <button className="bg-black px-7 text-white">
            Search
          </button>

        </div>
      </section>

      {/* Explore */}
      <section className="mx-auto max-w-7xl px-6 pb-20">

        <h3 className="mb-6 text-2xl font-bold">
          Explore
        </h3>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {[
            ["Books", "Explore books and collections"],
            ["Poets", "Discover poets and their work"],
            ["Authors", "Explore writers and authors"],
            ["Kalaam", "Read ghazals, naat and more"],
          ].map(([title, description]) => (

            <div
              key={title}
              className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
            >

              <h4 className="text-xl font-semibold">
                {title}
              </h4>

              <p className="mt-2 text-sm text-gray-600">
                {description}
              </p>

            </div>

          ))}

        </div>
      </section>

      {/* Featured Kalaam */}
      <section className="bg-white py-16">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-8 flex items-center justify-between">

            <h3 className="text-2xl font-bold">
              Featured Kalaam
            </h3>

            <a href="#" className="text-sm underline">
              View all
            </a>

          </div>

          <div className="rounded-2xl border p-8">

            <p className="text-sm text-gray-500">
              Featured Poetry
            </p>

            <h4 className="mt-2 text-2xl font-semibold">
              A collection of timeless verses
            </h4>

            <p className="mt-3 max-w-2xl text-gray-600">
              Discover beautiful literary works from poets and writers
              across different traditions.
            </p>

          </div>

        </div>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <h3 className="mb-6 text-2xl font-bold">
          Articles
        </h3>

        <div className="grid gap-5 md:grid-cols-3">

          {[1, 2, 3].map((item) => (

            <article
              key={item}
              className="rounded-2xl border bg-white p-6"
            >

              <p className="text-sm text-gray-500">
                Literature
              </p>

              <h4 className="mt-2 text-xl font-semibold">
                Understanding the world of literature
              </h4>

              <p className="mt-3 text-sm text-gray-600">
                Read stories, history and insights from the world
                of literature.
              </p>

            </article>

          ))}

        </div>
      </section>

      {/* Popular Content */}
      <section className="bg-white py-16">

        <div className="mx-auto max-w-7xl px-6">

          <h3 className="mb-6 text-2xl font-bold">
            Popular Content
          </h3>

          <div className="grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border p-6">
              <h4 className="font-semibold">
                Popular Books
              </h4>

              <p className="mt-2 text-sm text-gray-600">
                Explore books loved by readers.
              </p>
            </div>

            <div className="rounded-2xl border p-6">
              <h4 className="font-semibold">
                Popular Poets
              </h4>

              <p className="mt-2 text-sm text-gray-600">
                Discover renowned poets and their works.
              </p>
            </div>

            <div className="rounded-2xl border p-6">
              <h4 className="font-semibold">
                Popular Kalaam
              </h4>

              <p className="mt-2 text-sm text-gray-600">
                Read the most explored literary works.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Suggest a Book */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">

        <h3 className="text-3xl font-bold">
          Suggest a Book
        </h3>

        <p className="mt-3 text-gray-600">
          Know a book that deserves to be here? Suggest it to us.
        </p>

        <button className="mt-6 rounded-xl bg-black px-6 py-3 text-white">
          Suggest a Book
        </button>

      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8 text-center text-sm text-gray-500">
        © 2026 Adab. All rights reserved.
      </footer>

    </main>
  );
}