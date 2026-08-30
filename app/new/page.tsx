import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import NewPostForm from "@/components/NewPostForm";

export const metadata: Metadata = { title: "New post · Spark" };

export default async function NewPostPage() {
  if (!(await getSessionUserId())) redirect("/login");
  return <NewPostForm />;
}
