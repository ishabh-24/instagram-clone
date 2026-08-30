import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

const MAX_COMMENT_LENGTH = 300;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const { id: postId } = await params;
  const body = await request.json().catch(() => null);
  const text = String(body?.text ?? "").trim();

  if (!text || text.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json(
      { error: `Comment must be 1-${MAX_COMMENT_LENGTH} characters` },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { text, postId, authorId: userId },
    include: { author: { select: { username: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
