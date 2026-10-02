export default function PoetsPage() {
  const poets = [
    "Mirza Ghalib",
    "Allama Iqbal",
    "Faiz Ahmed Faiz",
    "Mir Taqi Mir",
    "Parveen Shakir",
    "Jaun Elia",
  ];

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">Poets</h1>

        <p className="mt-3 text-gray-600">
          Discover poets and explore their literary works.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {poets.map((poet) => (
            <div
              key={poet}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  Photo
                </div>

                <div>
                  <h2 className="text-xl font-semibold">{poet}</h2>
                  <p className="text-sm text-gray-500">Poet</p>
                </div>
              </div>

              <button className="mt-6 rounded-lg bg-black px-4 py-2 text-sm text-white">
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}