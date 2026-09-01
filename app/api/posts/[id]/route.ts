import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.authorId !== userId) {
    return NextResponse.json(
      { error: "You can only delete your own posts" },
      { status: 403 }
    );
  }

  // Likes and comments are removed automatically via onDelete: Cascade
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
