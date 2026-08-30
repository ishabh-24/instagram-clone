"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { timeAgo } from "@/lib/format";

export type FeedComment = {
  id: string;
  text: string;
  author: { username: string };
};

export type FeedPost = {
  id: string;
  imageData: string;
  caption: string | null;
  createdAt: string;
  author: { username: string; name: string | null };
  likeCount: number;
  likedByMe: boolean;
  comments: FeedComment[];
};

export default function PostCard({
  post,
  loggedIn,
}: {
  post: FeedPost;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [comments, setComments] = useState(post.comments);
  const [commentText, setCommentText] = useState("");
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [sending, setSending] = useState(false);

  async function toggleLike() {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    // Optimistic update, then sync with the server's answer
    setLiked(!liked);
    setLikeCount((c) => c + (liked ? -1 : 1));
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    }
  }

  function handleDoubleTap() {
    setShowBigHeart(true);
    setTimeout(() => setShowBigHeart(false), 800);
    if (!liked) toggleLike();
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || sending) return;
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((c) => [...c, data.comment]);
        setCommentText("");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <article className="animate-fade-up overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <header className="flex items-center justify-between px-4 py-3">
        <Link
          href={`/u/${post.author.username}`}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-sm font-bold text-white">
            {post.author.username[0].toUpperCase()}
          </span>
          <span className="text-sm font-semibold">@{post.author.username}</span>
        </Link>
        <time className="text-xs text-neutral-400">{timeAgo(post.createdAt)}</time>
      </header>

      <div
        className="relative cursor-pointer select-none"
        onDoubleClick={handleDoubleTap}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageData}
          alt={post.caption ?? `Photo by @${post.author.username}`}
          className="aspect-square w-full object-cover"
        />
        {showBigHeart && (
          <span
            aria-hidden
            className="absolute inset-0 flex animate-heart-pop items-center justify-center text-8xl drop-shadow-lg"
          >
            ❤️
          </span>
        )}
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={`text-2xl transition-transform hover:scale-110 ${
              liked ? "animate-pop" : ""
            }`}
          >
            {liked ? "❤️" : "🤍"}
          </button>
          <span className="text-sm font-semibold">
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </span>
        </div>

        {post.caption && (
          <p className="mt-2 text-sm">
            <Link
              href={`/u/${post.author.username}`}
              className="font-semibold hover:underline"
            >
              @{post.author.username}
            </Link>{" "}
            {post.caption}
          </p>
        )}

        {comments.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {comments.map((comment) => (
              <li key={comment.id} className="text-sm text-neutral-700">
                <Link
                  href={`/u/${comment.author.username}`}
                  className="font-semibold text-neutral-900 hover:underline"
                >
                  @{comment.author.username}
                </Link>{" "}
                {comment.text}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={submitComment} className="mt-3 flex gap-2 border-t border-neutral-100 pt-3">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={300}
            placeholder={loggedIn ? "Add a comment…" : "Log in to comment"}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
          {commentText.trim() && (
            <button
              type="submit"
              disabled={sending}
              className="text-sm font-semibold text-sky-600 transition-colors hover:text-sky-800 disabled:opacity-50"
            >
              Post
            </button>
          )}
        </form>
      </div>
    </article>
  );
}
