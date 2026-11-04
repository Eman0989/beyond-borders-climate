
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when Escape is pressed
  useEffect(() => {
    if (!sidebarOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen]);

  function openSidebar() {
    setSidebarOpen(true);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#071310] text-white">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="min-h-screen lg:pl-64">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#071310]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
              aria-controls="mobile-navigation"
              onClick={openSidebar}
              className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Climate Intelligence Platform
              </p>

              <p className="truncate text-xs text-slate-500">
                Beyond Borders Climate
              </p>
            </div>
          </div>

          {/* STATUS INDICATOR */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-xs text-emerald-300 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Development Preview
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="mx-auto w-full max-w-[1600px] min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
