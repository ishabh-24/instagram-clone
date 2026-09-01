import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} · Spark` };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const [profile, viewer] = await Promise.all([
    prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        createdAt: true,
        posts: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            imageData: true,
            caption: true,
            _count: { select: { likes: true, comments: true } },
          },
        },
        _count: { select: { posts: true } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!profile) notFound();

  const totalLikes = profile.posts.reduce(
    (sum, post) => sum + post._count.likes,
    0
  );
  const isOwnProfile = viewer?.id === profile.id;

  return (
    <section className="mx-auto w-full max-w-2xl animate-fade-up px-4 pt-8">
      <header className="flex items-center gap-5 sm:gap-8">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-3xl font-bold text-white sm:h-24 sm:w-24">
          {profile.username[0].toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-2xl">
            {profile.name ?? `@${profile.username}`}
          </h1>
          <p className="text-sm text-neutral-500">@{profile.username}</p>
          {profile.bio && <p className="mt-1 text-sm">{profile.bio}</p>}
          <div className="mt-2 flex gap-4 text-sm">
            <span>
              <strong>{profile._count.posts}</strong>{" "}
              {profile._count.posts === 1 ? "post" : "posts"}
            </span>
            <span>
              <strong>{totalLikes}</strong>{" "}
              {totalLikes === 1 ? "like" : "likes"}
            </span>
            <span className="text-neutral-500">
              joined{" "}
              {profile.createdAt.toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      {profile.posts.length === 0 ? (
        <div className="pt-16 text-center text-neutral-500">
          <p className="text-4xl" aria-hidden>
            📷
          </p>
          <p className="mt-3">No posts yet.</p>
          {isOwnProfile && (
            <Link
              href="/new"
              className="mt-4 inline-block rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
            >
              + Create your first post
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-3 gap-1 sm:gap-2">
          {profile.posts.map((post) => (
            <Link
              key={post.id}
              href={`/p/${post.id}`}
              className="group relative aspect-square overflow-hidden rounded-md bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageData}
                alt={post.caption ?? "Post"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                <span>❤️ {post._count.likes}</span>
                <span>💬 {post._count.comments}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
