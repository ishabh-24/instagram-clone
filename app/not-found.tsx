import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-md animate-fade-up flex-col items-center px-4 pt-24 text-center">
      <p className="text-5xl" aria-hidden>
        🔍
      </p>
      <h1 className="mt-4 text-2xl font-bold">Nothing here</h1>
      <p className="mt-2 text-neutral-500">
        That page or post doesn&apos;t exist (or was deleted).
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
      >
        Back to the feed
      </Link>
    </section>
  );
}
