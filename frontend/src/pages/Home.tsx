
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Earth,
  Factory,
  Globe2,
  Leaf,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

const features = [
  {
    icon: Earth,
    title: "Global Climate Explorer",
    description:
      "Explore emissions and climate indicators across countries through interactive visualizations.",
  },
  {
    icon: Factory,
    title: "SME Climate Simulator",
    description:
      "Estimate operational emissions and explore the potential impact of more sustainable decisions.",
  },
  {
    icon: BrainCircuit,
    title: "AI Policy Intelligence",
    description:
      "Understand climate policies and sustainability strategies through evidence-grounded AI insights.",
  },
  {
    icon: BarChart3,
    title: "Cross-Border Insights",
    description:
      "Compare countries, track emission trends, and understand the global dimensions of climate change.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#071310] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-28 pt-28">
        <div className="absolute -right-40 top-0 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm text-emerald-300">
                <Leaf size={15} />
                Intelligence for a changing planet
              </div>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.1] tracking-tight md:text-7xl">
                Climate change
                <br />
                knows{" "}
                <span className="text-emerald-400">
                  no borders.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">
                Explore global climate data, understand policy
                decisions, and simulate sustainable solutions
                through one intelligent platform.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 rounded-full bg-emerald-400 px-7 py-4 font-semibold text-[#071310] transition hover:bg-emerald-300"
                >
                  Explore Platform
                  <ArrowUpRight size={19} />
                </Link>

                <a
                  href="#features"
                  className="flex items-center gap-3 rounded-full border border-white/15 px-7 py-4 text-slate-200 transition hover:bg-white/5"
                >
                  Discover Features
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="relative flex min-h-[400px] items-center justify-center">
              <div className="absolute h-[350px] w-[350px] rounded-full bg-emerald-400/10 blur-[90px]" />

              <div className="relative flex h-80 w-80 items-center justify-center rounded-full border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 via-teal-900/30 to-[#071310] shadow-[0_0_100px_rgba(16,185,129,0.13)] md:h-96 md:w-96">
                <div className="absolute inset-6 rounded-full border border-dashed border-emerald-400/20" />
                <Globe2
                  size={180}
                  strokeWidth={0.7}
                  className="text-emerald-300/70"
                />
              </div>

              <div className="absolute bottom-6 left-0 rounded-2xl border border-white/10 bg-[#10241d]/95 p-5 shadow-xl">
                <div className="text-xs uppercase tracking-wider text-slate-400">
                  Climate Intelligence
                </div>
                <div className="mt-2 text-xl font-semibold text-emerald-300">
                  Global Perspective
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Data-driven insights
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="border-y border-white/10 bg-white/[0.02] px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {[
            ["01", "Explore", "Understand global climate patterns."],
            ["02", "Analyze", "Compare emissions and policy decisions."],
            ["03", "Act", "Model more sustainable alternatives."],
          ].map(([number, title, description]) => (
            <div key={number} className="flex gap-5">
              <span className="text-3xl font-light text-emerald-400">
                {number}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Platform capabilities
            </p>

            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Climate intelligence,
              <br />
              made accessible.
            </h2>

            <p className="mt-6 text-slate-400">
              From emissions analysis to practical sustainability
              decisions, our platform brings climate intelligence
              together in one place.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-white/10 bg-[#0d1e19] p-9 transition hover:border-emerald-400/30 hover:bg-[#11271f]"
                >
                  <div className="mb-8 inline-flex rounded-2xl bg-emerald-400/10 p-4 text-emerald-400">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-2xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-4 max-w-md leading-7 text-slate-400">
                    {feature.description}
                  </p>

                  <Link
                    to="/dashboard"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-emerald-400 transition group-hover:gap-3"
                  >
                    Explore feature
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section
        id="mission"
        className="border-t border-white/10 bg-[#0b1b16] px-6 py-28"
      >
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center text-emerald-400">
            <Globe2 size={42} strokeWidth={1.2} />
          </div>

          <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
            A global problem deserves
            <span className="text-emerald-400">
              {" "}a global perspective.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
            Beyond Borders Climate aims to make climate
            information understandable, accessible, and
            actionable for individuals, businesses, and
            communities.
          </p>

          <Link
            to="/dashboard"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-emerald-400 px-8 py-4 font-semibold text-[#071310] transition hover:bg-emerald-300"
          >
            Start Exploring
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <div className="flex items-center gap-2">
            <Globe2 size={17} className="text-emerald-400" />
            Beyond Borders Climate
          </div>

          <p>
            Built for a more informed and sustainable future.
          </p>
        </div>
      </footer>
    </div>
  );
}
