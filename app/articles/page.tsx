export default function ArticlesPage() {
  const articles = [
    "The History of Urdu Literature",
    "Understanding Ghazal",
    "Famous Poets of South Asia",
    "The Evolution of Hindi Literature",
    "Literature and Culture",
    "Classical Poetry and Its Influence",
  ];

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">Articles</h1>

        <p className="mt-3 text-gray-600">
          Read articles, stories and insights from the world of literature.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100">
                Article Image
              </div>

              <p className="mt-5 text-sm text-gray-500">Literature</p>

              <h2 className="mt-2 text-xl font-semibold">
                {article}
              </h2>

              <p className="mt-3 text-sm text-gray-600">
                Read more about literature, poetry, writers and literary
                traditions.
              </p>

              <button className="mt-5 rounded-lg bg-black px-4 py-2 text-sm text-white">
                Read Article
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}