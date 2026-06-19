import Link from "next/link";

async function getRuns() {
  const res = await fetch("http://localhost:8000/runs/", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json();
}

export default async function Home() {
  const runs = await getRuns();

  return (
    <main className="p-8">
      <Link
        href="/import"
        className="text-blue-600 underline mb-4 inline-block"
      >
        Import GPX
      </Link>
      <Link href="/runs" className="text-blue-600 underline mb-4 inline-block">
        All Runs
      </Link>
      <h1 className="text-2xl font-bold mb-4">Runs</h1>
      {runs.length === 0 ? (
        <p className="text-gray-500">No runs yet.</p>
      ) : (
        <ul className="space-y-2">
          {runs.map((run: any) => (
            <li key={run.id} className="border p-3 rounded">
              {new Date(run.date).toLocaleDateString()} — {run.distance_km} km
              in {Math.round(run.duration_seconds / 60)} min
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
