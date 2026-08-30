import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Spark <span aria-hidden>⚡️</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link
              href="/new"
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
            >
              + Post
            </Link>
            <Link
              href={`/u/${user.username}`}
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              @{user.username}
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
