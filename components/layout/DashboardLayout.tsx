import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
