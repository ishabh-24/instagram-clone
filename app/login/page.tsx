import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getSessionUserId } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in · Spark" };

export default async function LoginPage() {
  if (await getSessionUserId()) redirect("/");
  return <AuthForm mode="login" />;
}
