"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fitFile, setFitFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    if (fitFile) {
      formData.append("fit_file", fitFile);
    }

    try {
      const res = await fetch("http://localhost:8000/runs/import-gpx", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? "Import failed");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <main className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Import GPX</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".gpx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm border rounded p-2"
        />

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            FIT file (optional)
          </label>
          <input
            type="file"
            accept=".fit"
            onChange={(e) => setFitFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm border rounded p-2"
          />
        </div>

        <button
          type="submit"
          disabled={!file || status === "uploading"}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading..." : "Import"}
        </button>

        {status === "error" && (
          <p className="text-red-600 text-sm">{errorMsg}</p>
        )}
      </form>
    </main>
  );
}
