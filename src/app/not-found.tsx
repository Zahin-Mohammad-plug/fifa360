import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-950">
      <div className="text-[80px] mb-4">⚽</div>
      <h1 className="text-3xl font-black mb-3 text-white">Page Not Found</h1>
      <p className="text-base mb-8 max-w-sm leading-relaxed text-gray-400">
        Looks like this page went out of bounds. Head back to the matchday hub.
      </p>
      <Link
        href="/"
        className="px-8 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
