import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { formatDuration } from "@/lib/format";
import type { Run } from "@/lib/types";

async function getRuns(): Promise<Run[]> {
  const res = await fetch("http://localhost:8000/runs/", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json();
}

const columns: TableColumn<Run>[] = [
  {
    key: "date",
    header: "Date",
    render: (run) => (
      <Link href={`/runs/${run.id}`} className="text-blue-600 underline">
        {new Date(run.date).toLocaleDateString()}
      </Link>
    ),
  },
  {
    key: "distance",
    header: "Distance (km)",
    align: "right",
    render: (run) => run.distance_km.toFixed(2),
  },
  {
    key: "duration",
    header: "Duration",
    align: "right",
    render: (run) => formatDuration(run.duration_seconds),
  },
  {
    key: "elevation",
    header: "Elev Gain (m)",
    align: "right",
    render: (run) => run.elevation_gain_m?.toFixed(0) ?? "—",
  },
  {
    key: "avg_hr",
    header: "Avg HR",
    align: "right",
    render: (run) => run.avg_heart_rate_bpm?.toFixed(0) ?? "—",
  },
  {
    key: "max_hr",
    header: "Max HR",
    align: "right",
    render: (run) => run.max_heart_rate_bpm?.toFixed(0) ?? "—",
  },
  {
    key: "cadence",
    header: "Avg Cadence",
    align: "right",
    render: (run) => run.avg_cadence_spm?.toFixed(0) ?? "—",
  },
  {
    key: "source",
    header: "Source",
    render: (run) => run.source,
  },
  {
    key: "notes",
    header: "Notes",
    render: (run) => run.notes ?? "—",
  },
];

export default async function RunsPage() {
  const runs = await getRuns();

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">All Runs</h1>
      <Table
        columns={columns}
        data={runs}
        rowKey={(run) => run.id}
        emptyMessage="No runs yet."
      />
    </main>
  );
}
