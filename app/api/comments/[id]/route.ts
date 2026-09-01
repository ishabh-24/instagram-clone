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
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { authorId: true, post: { select: { authorId: true } } },
  });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // The comment's author and the post's owner may both delete a comment
  const allowed = comment.authorId === userId || comment.post.authorId === userId;
  if (!allowed) {
    return NextResponse.json(
      { error: "You can only delete your own comments" },
      { status: 403 }
    );
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
