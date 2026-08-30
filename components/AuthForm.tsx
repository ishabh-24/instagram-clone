"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Field = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
};

const REGISTER_FIELDS: Field[] = [
  { name: "name", label: "Full name", type: "text", placeholder: "Ada Lovelace", autoComplete: "name" },
  { name: "username", label: "Username", type: "text", placeholder: "ada", autoComplete: "username" },
  { name: "email", label: "Email", type: "email", placeholder: "ada@example.com", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", placeholder: "8+ characters", autoComplete: "new-password" },
];

const LOGIN_FIELDS: Field[] = [
  { name: "identifier", label: "Username or email", type: "text", placeholder: "ada", autoComplete: "username" },
  { name: "password", label: "Password", type: "password", placeholder: "Your password", autoComplete: "current-password" },
];

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fields = mode === "login" ? LOGIN_FIELDS : REGISTER_FIELDS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-12 w-full max-w-sm animate-fade-up px-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold tracking-tight">
          {mode === "login" ? "Welcome back" : "Join Spark"}
        </h1>
        <p className="mt-1 text-center text-sm text-neutral-500">
          {mode === "login"
            ? "Log in to see the latest posts"
            : "Share your moments with the world"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {fields.map((field) => (
            <label key={field.name} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-700">{field.label}</span>
              <input
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                required
                value={values[field.name] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.name]: e.target.value }))
                }
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition-shadow focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              />
            </label>
          ))}

          {error && (
            <p className="animate-fade-up rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-neutral-500">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="font-medium text-neutral-900 hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-neutral-900 hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
