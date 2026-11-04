
import { Link } from "react-router-dom";
import { ArrowUpRight, Globe2 } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071310]/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-400">
            <Globe2 size={25} />
          </div>

          <span className="text-lg font-bold tracking-tight text-white">
            BEYOND BORDERS
            <span className="ml-2 font-normal text-emerald-400">
              CLIMATE
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="/#features" className="hover:text-white">
            Features
          </a>
          <a href="/#mission" className="hover:text-white">
            Our Mission
          </a>
          <Link to="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
        </div>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-[#071310] transition hover:bg-emerald-300"
        >
          Launch App <ArrowUpRight size={16} />
        </Link>
      </nav>
    </header>
  );
}
