import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

const MAX_IMAGE_CHARS = 2_000_000; // ~1.5MB of base64
const MAX_CAPTION_LENGTH = 500;

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const imageData = String(body?.imageData ?? "");
  const caption = String(body?.caption ?? "").trim();

  if (!/^data:image\/(jpeg|png|webp);base64,/.test(imageData)) {
    return NextResponse.json({ error: "A photo is required" }, { status: 400 });
  }
  if (imageData.length > MAX_IMAGE_CHARS) {
    return NextResponse.json({ error: "Image is too large" }, { status: 413 });
  }
  if (caption.length > MAX_CAPTION_LENGTH) {
    return NextResponse.json(
      { error: `Caption must be under ${MAX_CAPTION_LENGTH} characters` },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({
    data: { imageData, caption: caption || null, authorId: userId },
    select: { id: true },
  });

  return NextResponse.json({ post }, { status: 201 });
}

export async function GET() {
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
  return NextResponse.json({ posts });
}
