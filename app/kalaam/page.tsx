export default function KalaamPage() {
  const categories = [
    ["Ghazal", "Explore beautiful ghazals from renowned poets."],
    ["Naat", "Discover devotional poetry and naat."],
    ["Manqabat", "Explore traditional manqabats and devotional works."],
    ["Sher", "Read memorable individual verses and sher."],
    ["Ba’it", "Explore classical poetic verses and ba’it."],
    ["Qit’aa", "Discover qit’aa and other forms of poetry."],
  ];

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">Kalaam</h1>

        <p className="mt-3 text-gray-600">
          Explore poetry, verses and literary works from different traditions.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(([title, description]) => (
            <div
              key={title}
              className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1"
            >
              <h2 className="text-2xl font-semibold">{title}</h2>

              <p className="mt-3 text-sm text-gray-600">
                {description}
              </p>

              <button className="mt-6 rounded-lg bg-black px-4 py-2 text-sm text-white">
                Explore
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}