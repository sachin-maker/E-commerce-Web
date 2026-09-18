"use client"

const WishlistLoading = () => {
  return (
    <main className="min-h-[60vh] px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 h-10 w-56 animate-pulse rounded bg-gray-200" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border bg-white"
            >
              <div className="h-56 animate-pulse bg-gray-200" />

              <div className="space-y-3 p-4">
                <div className="h-5 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-10 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default WishlistLoading;