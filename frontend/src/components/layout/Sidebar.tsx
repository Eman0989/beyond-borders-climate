
import { Link, NavLink } from "react-router-dom";
import {
  BarChart3,
  BrainCircuit,
  ChevronRight,
  Earth,
  Factory,
  GitCompareArrows,
  Home,
  Leaf,
  X,
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigation = [
  {
    title: "Overview",
    path: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Climate Explorer",
    path: "/explorer",
    icon: Earth,
  },
  {
    title: "SME Simulator",
    path: "/simulator",
    icon: Factory,
  },
  {
    title: "AI Policy Assistant",
    path: "/assistant",
    icon: BrainCircuit,
  },
  {
    title: "Compare Countries",
    path: "/compare",
    icon: GitCompareArrows,
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* MOBILE BACKDROP */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        id="mobile-navigation"
        aria-label="Main navigation"
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          overflow-y-auto
          border-r border-white/10
          bg-[#091813]
          transition-transform duration-300
          lg:translate-x-0
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* BRAND HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-6">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-400">
              <Leaf size={23} />
            </div>

            <div>
              <div className="text-sm font-bold tracking-wide text-white">
                BEYOND BORDERS
              </div>

              <div className="text-xs tracking-[0.22em] text-emerald-400">
                CLIMATE
              </div>
            </div>
          </Link>

          {/* MOBILE CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="px-4 pt-8">
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>

          <nav aria-label="Climate platform" className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between
                    rounded-xl px-3 py-3 text-sm
                    transition-colors duration-200
                    ${
                      isActive
                        ? "bg-emerald-400/10 font-medium text-emerald-300"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon size={19} />
                    {item.title}
                  </span>

                  <ChevronRight
                    size={15}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-auto border-t border-white/10 p-4">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Home size={18} />
            Back to Website
          </Link>

          {/* CLIMATE INFO CARD */}
          <div className="mt-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Leaf size={14} />
              Climate Intelligence
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Explore data. Understand impacts.
              Make informed sustainability decisions.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
