import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = String(body?.identifier ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Username/email and password are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });

  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) {
    return NextResponse.json(
      { error: "Incorrect username or password" },
      { status: 401 }
    );
  }

  await createSession(user.id);
  return NextResponse.json({
    user: { id: user.id, username: user.username, name: user.name },
  });
}
