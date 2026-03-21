import Link from "next/link";

function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-garden-50 to-white flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-garden-500 mb-4">
          Canopy
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Continuous remote care that keeps patients healthy at home
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/garden"
            className="group block p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-garden-400"
          >
            <div className="text-4xl mb-4">🌱</div>
            <h2 className="text-xl font-semibold text-garden-500 mb-2">
              The Garden
            </h2>
            <p className="text-sm text-gray-500">
              Patient wellness companion
            </p>
          </Link>

          <Link
            href="/caregiver"
            className="group block p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-sky-200"
          >
            <div className="text-4xl mb-4">💙</div>
            <h2 className="text-xl font-semibold text-blue-500 mb-2">
              Caregiver
            </h2>
            <p className="text-sm text-gray-500">
              Family peace of mind
            </p>
          </Link>

          <Link
            href="/clinical"
            className="group block p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-clinical-teal"
          >
            <div className="text-4xl mb-4">🏥</div>
            <h2 className="text-xl font-semibold text-clinical-teal mb-2">
              Clinical
            </h2>
            <p className="text-sm text-gray-500">
              Healthcare intelligence
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
