"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const MAX_DIMENSION = 1080;

/** Downscale + re-encode the chosen image as a JPEG data URL so it stays small. */
async function compressImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Not a valid image"));
    el.src = dataUrl;
  });

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function NewPostForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      setPreview(await compressImage(file));
    } catch {
      setError("That file doesn't look like an image");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preview) {
      setError("Pick a photo first");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: preview, caption }),
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
    <div className="mx-auto mt-8 w-full max-w-md animate-fade-up px-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">New post</h1>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative aspect-square w-full overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-neutral-400"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview of your upload"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400 transition-colors group-hover:text-neutral-500">
                <span className="text-4xl" aria-hidden>
                  📷
                </span>
                <span className="text-sm font-medium">
                  Click to choose a photo
                </span>
              </span>
            )}
          </button>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">Caption</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Write a caption…"
              className="resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition-shadow focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
            />
          </label>

          {error && (
            <p className="animate-fade-up rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !preview}
            className="rounded-lg bg-neutral-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? "Posting…" : "Share"}
          </button>
        </form>
      </div>
    </div>
  );
}
