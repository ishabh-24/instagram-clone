import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import PostCard, { type FeedPost } from "@/components/PostCard";

export const dynamic = "force-dynamic";

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

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { username: true, name: true } },
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { username: true } } },
      },
    },
  });

  const feed: FeedPost[] = posts.map((post) => ({
    id: post.id,
    imageData: post.imageData,
    caption: post.caption,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    likeCount: post.likes.length,
    likedByMe: post.likes.some((like) => like.userId === user.id),
    comments: post.comments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      author: comment.author,
    })),
  }));

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-6">
      {feed.length === 0 ? (
        <div className="animate-fade-up pt-16 text-center">
          <p className="text-4xl" aria-hidden>
            📷
          </p>
          <h1 className="mt-3 text-xl font-bold">No posts yet</h1>
          <p className="mt-1 text-neutral-500">Be the first to share a photo!</p>
          <Link
            href="/new"
            className="mt-6 inline-block rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
          >
            + Create a post
          </Link>
        </div>
      ) : (
        feed.map((post) => <PostCard key={post.id} post={post} loggedIn />)
      )}
    </section>
  );
}
