import Link from "next/link";
import { notFound } from "next/navigation";
import Table, { TableColumn } from "@/components/Table";
import { formatDuration } from "@/lib/format";
import type { FitPoint, RunDetail, RunPoint } from "@/lib/types";

async function getRun(id: string): Promise<RunDetail | null> {
  const res = await fetch(`http://localhost:8000/runs/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch run");
  return res.json();
}

type SummaryRow = { field: string; value: string };

const summaryColumns: TableColumn<SummaryRow>[] = [
  { key: "field", header: "Field", render: (row) => row.field },
  { key: "value", header: "Value", render: (row) => row.value },
];

const pointColumns: TableColumn<RunPoint>[] = [
  {
    key: "time",
    header: "Time",
    render: (p) => (p.time ? new Date(p.time).toLocaleTimeString() : "—"),
  },
  {
    key: "lat",
    header: "Latitude",
    align: "right",
    render: (p) => p.latitude.toFixed(5),
  },
  {
    key: "lon",
    header: "Longitude",
    align: "right",
    render: (p) => p.longitude.toFixed(5),
  },
  {
    key: "elevation",
    header: "Elev (m)",
    align: "right",
    render: (p) => p.elevation?.toFixed(1) ?? "—",
  },
  {
    key: "hr",
    header: "HR",
    align: "right",
    render: (p) => p.heart_rate?.toString() ?? "—",
  },
  {
    key: "cadence",
    header: "Cadence",
    align: "right",
    render: (p) => p.cadence?.toString() ?? "—",
  },
  {
    key: "course",
    header: "Course (°)",
    align: "right",
    render: (p) => p.course?.toFixed(0) ?? "—",
  },
  {
    key: "hacc",
    header: "H-Acc (m)",
    align: "right",
    render: (p) => p.horizontal_accuracy?.toFixed(1) ?? "—",
  },
  {
    key: "vacc",
    header: "V-Acc (m)",
    align: "right",
    render: (p) => p.vertical_accuracy?.toFixed(1) ?? "—",
  },
];

const fitPointColumns: TableColumn<FitPoint>[] = [
  {
    key: "time",
    header: "Time",
    render: (p) => (p.time ? new Date(p.time).toLocaleTimeString() : "—"),
  },
  {
    key: "lat",
    header: "Latitude",
    align: "right",
    render: (p) => p.latitude?.toFixed(5) ?? "—",
  },
  {
    key: "lon",
    header: "Longitude",
    align: "right",
    render: (p) => p.longitude?.toFixed(5) ?? "—",
  },
  {
    key: "altitude",
    header: "Alt (m)",
    align: "right",
    render: (p) => p.altitude?.toFixed(1) ?? "—",
  },
  {
    key: "hr",
    header: "HR",
    align: "right",
    render: (p) => p.heart_rate?.toString() ?? "—",
  },
  {
    key: "cadence",
    header: "Cadence",
    align: "right",
    render: (p) => p.cadence?.toString() ?? "—",
  },
  {
    key: "distance",
    header: "Dist (m)",
    align: "right",
    render: (p) => p.distance_m?.toFixed(1) ?? "—",
  },
  {
    key: "speed",
    header: "Speed (m/s)",
    align: "right",
    render: (p) => p.speed_mps?.toFixed(2) ?? "—",
  },
  {
    key: "power",
    header: "Power (W)",
    align: "right",
    render: (p) => p.power_w?.toString() ?? "—",
  },
  {
    key: "temp",
    header: "Temp (°C)",
    align: "right",
    render: (p) => p.temperature_c?.toFixed(1) ?? "—",
  },
];

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await getRun(id);

  if (!run) {
    notFound();
  }

  const summaryRows: SummaryRow[] = [
    { field: "Date", value: new Date(run.date).toLocaleString() },
    { field: "Distance", value: `${run.distance_km.toFixed(2)} km` },
    { field: "Duration", value: formatDuration(run.duration_seconds) },
    {
      field: "Elevation Gain",
      value:
        run.elevation_gain_m != null
          ? `${run.elevation_gain_m.toFixed(1)} m`
          : "—",
    },
    { field: "Source", value: run.source },
    {
      field: "Avg Heart Rate",
      value:
        run.avg_heart_rate_bpm != null
          ? `${run.avg_heart_rate_bpm.toFixed(0)} bpm`
          : "—",
    },
    {
      field: "Max Heart Rate",
      value:
        run.max_heart_rate_bpm != null
          ? `${run.max_heart_rate_bpm.toFixed(0)} bpm`
          : "—",
    },
    {
      field: "Avg Cadence",
      value:
        run.avg_cadence_spm != null
          ? `${run.avg_cadence_spm.toFixed(0)} spm`
          : "—",
    },
    { field: "Notes", value: run.notes ?? "—" },
  ];

  return (
    <main className="p-8 space-y-8">
      <div>
        <Link href="/runs" className="text-blue-600 underline">
          ← All Runs
        </Link>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-bold">Run Details</h1>
        <Table
          columns={summaryColumns}
          data={summaryRows}
          rowKey={(row) => row.field}
          numbered={false}
        />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">
          GPS Points ({run.points.length})
        </h2>
        <Table
          columns={pointColumns}
          data={run.points}
          rowKey={(p) => p.sequence}
          emptyMessage="No GPS points recorded for this run."
        />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">
          FIT Points ({run.fit_points.length})
        </h2>
        <Table
          columns={fitPointColumns}
          data={run.fit_points}
          rowKey={(p) => p.sequence}
          emptyMessage="No FIT data recorded for this run."
        />
      </div>
    </main>
  );
}
