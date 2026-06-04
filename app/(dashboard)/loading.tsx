export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading panel...</p>
      </div>
    </div>
  );
}
