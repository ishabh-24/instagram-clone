import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import PostCard, { type FeedPost } from "@/components/PostCard";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Post · Spark" };

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const [post, viewer] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { username: true, name: true } },
        likes: { select: { userId: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { username: true } } },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!post) notFound();

  const feedPost: FeedPost = {
    id: post.id,
    imageData: post.imageData,
    caption: post.caption,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    likeCount: post.likes.length,
    likedByMe: viewer
      ? post.likes.some((like) => like.userId === viewer.id)
      : false,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      author: comment.author,
    })),
  };

  return (
    <section className="mx-auto w-full max-w-md px-4 pt-6">
      <PostCard post={feedPost} viewerUsername={viewer?.username ?? null} />
    </section>
  );
}
