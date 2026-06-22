import type { ReactNode } from "react";

export type TableAlign = "left" | "right" | "center";

export type TableColumn<T> = {
  key: string;
  header: string;
  align?: TableAlign;
  render: (row: T) => ReactNode;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  numbered?: boolean;
  emptyMessage?: string;
};

const alignClass: Record<TableAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export default function Table<T>({
  columns,
  data,
  rowKey,
  numbered = true,
  emptyMessage = "No data to display.",
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="border-2 border-black p-6 text-center font-mono text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-2 border-black">
      <table className="w-full border-collapse font-mono text-sm">
        <thead>
          <tr className="border-b-[3px] border-double border-black">
            {numbered && (
              <th className="whitespace-nowrap border-r border-black px-3 py-2 text-left font-bold text-amber-800">
                #
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`last:border-r-0 whitespace-nowrap border-r border-black px-3 py-2 font-bold text-amber-800 ${alignClass[col.align ?? "left"]}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={rowKey(row)}
              className={
                i === data.length - 1
                  ? "border-b-[3px] border-double border-black"
                  : "border-b border-dashed border-black"
              }
            >
              {numbered && (
                <td className="whitespace-nowrap border-r border-black px-3 py-2 text-blue-700">
                  {String(i + 1).padStart(2, "0")}
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`last:border-r-0 whitespace-nowrap border-r border-black px-3 py-2 text-blue-700 ${alignClass[col.align ?? "left"]}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
