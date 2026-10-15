const languages = ["English", "हिंदी", "اردو", "Roman"];

const exploreItems = [
  {
    number: "01",
    title: "Books",
    subtitle: "Stories that stay with you",
    description: "Explore literary classics, collections and timeless books.",
    href: "/books",
    color: "bg-[#E1E9DE]",
    symbol: "▤",
  },
  {
    number: "02",
    title: "Poets",
    subtitle: "Voices beyond time",
    description: "Meet the poets behind unforgettable verses.",
    href: "/poets",
    color: "bg-[#F0DFE4]",
    symbol: "❝",
  },
  {
    number: "03",
    title: "Authors",
    subtitle: "The minds behind the words",
    description: "Discover writers, their journeys and their works.",
    href: "/authors",
    color: "bg-[#E9E3F2]",
    symbol: "✒",
  },
  {
    number: "04",
    title: "Kalaam",
    subtitle: "Words that touch the soul",
    description: "Read ghazals, naat and other literary expressions.",
    href: "/kalaam",
    color: "bg-[#F0E8D8]",
    symbol: "❋",
  },
];

const articles = [
  {
    category: "LITERARY HERITAGE",
    title: "The timeless beauty of Urdu literature",
    description:
      "Discover a literary tradition shaped by emotion, imagination and expression.",
    color: "bg-[#E1E9DE]",
  },
  {
    category: "POETRY & VERSE",
    title: "Finding meaning between the lines",
    description:
      "Explore the layers of meaning hidden within poetry and verse.",
    color: "bg-[#F0DFE4]",
  },
  {
    category: "LANGUAGE & CULTURE",
    title: "Words that connect generations",
    description:
      "A celebration of the words, stories and traditions we carry forward.",
    color: "bg-[#E9E3F2]",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F5F0] text-[#34443B]">
      {/* Navigation */}
      <header className="border-b border-[#E4DED5] bg-[#FFFEFC]/90">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <a href="/" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#34443B] font-serif text-2xl text-white">
              A
            </span>
            <span>
              <span className="block font-serif text-3xl tracking-wide">
                Adab
              </span>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-[#827D73]">
                A world of words
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-6 text-sm text-[#565B52] lg:flex">
            <a className="hover:text-[#9A6575]" href="/books">Books</a>
            <a className="hover:text-[#9A6575]" href="/poets">Poets</a>
            <a className="hover:text-[#9A6575]" href="/authors">Authors</a>
            <a className="hover:text-[#9A6575]" href="/kalaam">Kalaam</a>
            <a className="hover:text-[#9A6575]" href="/articles">Articles</a>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {languages.map((language, index) => (
              <button
                key={language}
                type="button"
                aria-label={`Interface language: ${language}`}
                className={`rounded-full border px-2.5 py-1.5 text-xs transition sm:px-3 ${
                  index === 0
                    ? "border-[#34443B] bg-[#34443B] text-white"
                    : "border-[#E4DED5] bg-white hover:border-[#9A6575] hover:text-[#9A6575]"
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex gap-5 overflow-x-auto border-t border-[#E4DED5] px-5 py-3 text-sm lg:hidden">
          <a href="/books">Books</a>
          <a href="/poets">Poets</a>
          <a href="/authors">Authors</a>
          <a href="/kalaam">Kalaam</a>
          <a href="/articles">Articles</a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-[#E9E3F2]/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[#E1E9DE]/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-[#8B6A73]">
              <span className="h-px w-9 bg-[#B58C97]" />
              Literature · Poetry · Heritage
            </div>

            <h1 className="max-w-3xl font-serif text-5xl leading-[1.13] tracking-tight sm:text-6xl lg:text-7xl">
              Some words are read.
              <span className="mt-2 block italic text-[#9A6575]">
                Others are felt.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-[#727269] sm:text-lg">
              Step into a world of books, poets and timeless verses.
              Discover the beauty of literature, all in one place.
            </p>

            <form
              action="/search"
              method="GET"
              className="mt-9 flex max-w-xl items-center gap-2 rounded-2xl border border-[#E4DED5] bg-[#FFFEFC] p-2 shadow-[0_12px_40px_rgba(52,68,59,0.06)] focus-within:border-[#8D9D89]"
            >
              <span className="pl-3 text-xl text-[#8B9186]" aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                name="q"
                placeholder="Search books, poets, kalaam..."
                aria-label="Search books, poets and kalaam"
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-[#34443B] outline-none placeholder:text-[#9A998F]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#34443B] px-5 py-3 text-sm text-white transition hover:bg-[#526B56]"
              >
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs tracking-wide text-[#77786F]">
              <span>Books worth revisiting</span>
              <span className="text-[#B7A6A0]">✦</span>
              <span>Poetry worth remembering</span>
            </div>
          </div>

          {/* Decorative editorial panel */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rotate-3 rounded-[2rem] bg-[#E9E3F2]/70" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#E1E9DE] p-7 sm:p-10">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[#687B68]">
                <span>The art of words</span>
                <span>✳</span>
              </div>

              <div className="py-10 text-center sm:py-14">
                <div className="font-serif text-7xl text-[#526B56] sm:text-8xl">
                  ادب
                </div>
                <div className="mx-auto my-6 h-px w-16 bg-[#9AAE96]" />
                <p className="font-serif text-3xl italic leading-snug text-[#34443B] sm:text-4xl">
                  A home for
                  <br />
                  every kind of story.
                </p>
                <p className="mt-5 text-sm leading-6 text-[#687B68]">
                  Explore the words that shape our world.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#BFCDBA] pt-4 text-xs tracking-widest text-[#687B68]">
                <span>READ · DISCOVER · FEEL</span>
                <span>EST. 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#9A6575]">
              Find your next favourite
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl">Explore Adab</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#77786F]">
            From celebrated classics to voices waiting to be discovered.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {exploreItems.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className={`group rounded-3xl border border-white/80 ${item.color} p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(52,68,59,0.09)] sm:p-7`}
            >
              <div className="flex items-start justify-between">
                <span className="font-serif text-4xl text-[#526B56]">
                  {item.symbol}
                </span>
                <span className="text-xs tracking-widest text-[#8A8A7D]">
                  {item.number}
                </span>
              </div>
              <h3 className="mt-8 font-serif text-2xl">{item.title}</h3>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#8A6D73]">
                {item.subtitle}
              </p>
              <p className="mt-4 min-h-12 text-sm leading-6 text-[#686C63]">
                {item.description}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-[#34443B]/10 pt-4 text-sm">
                <span>Explore collection</span>
                <span className="transition group-hover:translate-x-1">↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured Kalaam */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#34443B] px-7 py-12 text-[#FFFEFC] sm:px-12 sm:py-16">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#D8C1C9]">
                A moment with poetry
              </p>
              <h2 className="font-serif text-4xl leading-tight sm:text-5xl">
                Featured Kalaam
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#D9DED7] sm:text-base">
                Enter the world of ghazals, verses and literary expressions.
                Find a few words that say what you have always felt.
              </p>
              <a
                href="/kalaam"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#E1E9DE] px-6 py-3 text-sm font-medium text-[#34443B] transition hover:bg-white"
              >
                Explore Kalaam <span>↗</span>
              </a>
            </div>
            <div className="hidden h-48 w-48 items-center justify-center rounded-full border border-white/20 bg-white/5 md:flex">
              <span className="font-serif text-8xl text-[#E8D4DA]">؏</span>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#9A6575]">
              Stories behind the stories
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl">
              From the journal
            </h2>
          </div>
          <a
            href="/articles"
            className="border-b border-[#9A6575] pb-1 text-sm text-[#815968] hover:text-[#34443B]"
          >
            Explore all articles ↗
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((article, index) => (
            <a
              href="/articles"
              key={article.title}
              className="group overflow-hidden rounded-3xl border border-[#E8E1D8] bg-[#FFFEFC] transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`flex h-40 items-center justify-center ${article.color}`}>
                <span className="font-serif text-6xl text-[#526B56]/80">
                  {["Aa", "❝", "ا"][index]}
                </span>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-medium tracking-[0.2em] text-[#9A6575]">
                  {article.category}
                </p>
                <h3 className="mt-3 font-serif text-2xl leading-snug">
                  {article.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#77786F]">
                  {article.description}
                </p>
                <p className="mt-5 text-sm text-[#526B56]">
                  Read article <span className="inline-block transition group-hover:translate-x-1">→</span>
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Popular Content */}
      <section className="border-y border-[#E4DED5] bg-[#FFFEFC] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#9A6575]">
            Worth exploring
          </p>
          <h2 className="mb-9 font-serif text-4xl sm:text-5xl">
            A little more to discover
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Popular Books",
                description: "Find literary works to add to your reading list.",
                href: "/books",
                symbol: "▤",
              },
              {
                title: "Beloved Poets",
                description: "Get to know the voices behind enduring verses.",
                href: "/poets",
                symbol: "❝",
              },
              {
                title: "Poetry & Kalaam",
                description: "Discover expressions of love, life and longing.",
                href: "/kalaam",
                symbol: "✳",
              },
            ].map((item, index) => (
              <a
                href={item.href}
                key={item.title}
                className={`group flex items-start gap-5 rounded-2xl p-6 transition hover:shadow-sm ${
                  ["bg-[#E1E9DE]", "bg-[#F0DFE4]", "bg-[#E9E3F2]"][index]
                }`}
              >
                <span className="font-serif text-4xl">{item.symbol}</span>
                <div className="flex-1">
                  <h3 className="font-serif text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#686C63]">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-block text-sm">
                    Discover more ↗
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Suggest a Book */}
      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#E4DED5] bg-[#F0DFE4]/60 px-6 py-12 text-center sm:px-12 sm:py-16">
          <span className="font-serif text-5xl text-[#9A6575]">✳</span>
          <p className="mt-5 text-xs uppercase tracking-[0.25em] text-[#8B6A73]">
            Help our library grow
          </p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
            Every great book deserves a place.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#6F6D68] sm:text-base">
            Have a favourite book you would love others to discover?
            Share your recommendation with the Adab community.
          </p>
          <a
            href="/suggestions"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#34443B] px-7 py-3.5 text-sm text-white transition hover:bg-[#526B56]"
          >
            Suggest a Book <span>↗</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E4DED5] bg-[#FFFEFC] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <a href="/" className="font-serif text-3xl">
            Adab<span className="text-[#9A6575]">.</span>
          </a>
          <p className="text-sm text-[#77786F]">
            A home for literature, poetry and timeless words.
          </p>
          <p className="text-xs text-[#8B8A80]">
            © 2026 Adab. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}