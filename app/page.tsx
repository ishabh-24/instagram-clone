import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <section className="mx-auto flex max-w-2xl animate-fade-up flex-col items-center px-4 pt-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Share your moments on <span aria-hidden>⚡️</span> Spark
        </h1>
        <p className="mt-4 max-w-md text-neutral-500">
          A tiny photo-sharing app. Post pictures, follow the feed, and spread
          some sparks.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/register"
            className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
          >
            Log in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl animate-fade-up px-4 pt-16 text-center">
      <h1 className="text-2xl font-bold">
        Welcome, {user.name ?? `@${user.username}`}!
      </h1>
      <p className="mt-2 text-neutral-500">
        The feed is coming soon — hang tight.
      </p>
    </section>
  );
}
