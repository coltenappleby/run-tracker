<main className="p-8 max-w-md">
  <h1 className="text-2xl font-bold mb-4">Import GPX</h1>

  <form onSubmit={handleSubmit} className="space-y-4">
    <input
      type="file"
      accept=".gpx"
      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      className="block w-full text-sm border rounded p-2"
    />

    <button
      type="submit"
      disabled={!file || status === "uploading"}
      className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {status === "uploading" ? "Uploading..." : "Import"}
    </button>

    {status === "error" && <p className="text-red-600 text-sm">{errorMsg}</p>}
  </form>
</main>;
