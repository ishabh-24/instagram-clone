import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getSessionUserId } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign up · Spark" };

export default async function RegisterPage() {
  if (await getSessionUserId()) redirect("/");
  return <AuthForm mode="register" />;
}
