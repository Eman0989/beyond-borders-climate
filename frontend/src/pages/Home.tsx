
import { Link } from "react-router-dom";

import {
  ArrowDown,
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

// ========================================
// PLATFORM FEATURES
// ========================================

const features = [
  {
    icon: Earth,
    label: "01 / EXPLORE",
    title: "A planet without borders.",
    description:
      "Navigate our interactive globe and explore historical carbon emissions across countries.",
    path: "/explorer",
    action: "Explore the globe",
  },
  {
    icon: BarChart3,
    label: "02 / UNDERSTAND",
    title: "The data behind the change.",
    description:
      "Compare national emissions, follow historical trends, and understand how countries differ.",
    path: "/compare",
    action: "Compare countries",
  },
  {
    icon: Factory,
    label: "03 / ACT",
    title: "Better decisions for business.",
    description:
      "Estimate electricity-related emissions and compare practical energy reduction scenarios.",
    path: "/simulator",
    action: "Open SME simulator",
  },
  {
    icon: BrainCircuit,
    label: "04 / COMING SOON",
    title: "Climate policy, made clearer.",
    description:
      "We're developing an AI policy assistant to make climate policy easier to navigate.",
    path: "/dashboard",
    action: "View the platform",
  },
];

// ========================================
// ORIGINAL MOUNTAIN BACKGROUND
// ========================================

const heroImage =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2200&q=85";

// ========================================
// HOME PAGE
// ========================================

export default function Home() {
  return (
    <div className="min-h-screen bg-[#06121b] text-white">
      <Navbar />

      {/* ======================================
          CINEMATIC LANDSCAPE HERO
      ====================================== */}

      <section className="relative flex min-h-[min(900px,calc(100svh-75px))] flex-col overflow-hidden bg-[#10232a]">

        {/* ORIGINAL BACKGROUND IMAGE */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${heroImage}")`,
          }}
        />

        {/* DARK CINEMATIC OVERLAY */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#04121f]/95 via-[#04121f]/70 to-[#04121f]/15"
        />

        {/* BOTTOM GRADIENT */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#06121b]/80 via-transparent to-[#06121b]/10"
        />

        {/* HERO CONTENT */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1300px] flex-1 flex-col justify-center px-6 py-20 sm:px-10 lg:px-16">
          <div className="max-w-[850px]">

            {/* EYEBROW TEXT */}
            <div className="mb-7 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#a7edf0]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b3e7eb] sm:text-xs">
                Climate intelligence for a changing world
              </p>
            </div>

            {/* MAIN HEADLINE */}
            <h1 className="max-w-[850px] text-[clamp(3.7rem,7.4vw,7.4rem)] font-semibold leading-[0.99] tracking-[-0.065em]">
              Climate change
              <br />
              knows no
              <br />
              borders.
            </h1>

            {/* SUPPORTING TEXT */}
            <p className="mt-9 max-w-[600px] text-base leading-8 text-slate-200 sm:text-lg">
              Understand the planet. Explore the evidence.
              Shape better decisions.
            </p>

            <p className="mt-3 max-w-[590px] text-sm leading-7 text-slate-300">
              An interactive climate-intelligence platform
              connecting global emissions data, country
              comparisons, and practical sustainability tools.
            </p>

            {/* HERO BUTTONS */}
            <div className="mt-9 flex flex-wrap items-center gap-3">

              {/* PRIMARY CTA — HIGH CONTRAST */}
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#b1edf0] px-7 py-3.5 text-sm font-bold !text-[#06121b] transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:!text-[#06121b]"
              >
                Explore the Platform
                <ArrowUpRight size={17} />
              </Link>

              {/* SECONDARY CTA */}
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/35 bg-[#06121b]/25 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/80 hover:bg-white/10"
              >
                Discover the Research
                <ArrowRight size={17} />
              </a>
            </div>

            {/* TOPIC LABELS */}
            <div className="mt-11 flex flex-wrap gap-2">
              {[
                "Global emissions",
                "Climate intelligence",
                "SME sustainability",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/25 bg-[#06121b]/30 px-4 py-2 text-xs text-slate-200 backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM HERO DETAILS */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1300px] flex-col gap-5 px-6 pb-8 sm:px-10 md:flex-row md:items-end md:justify-between lg:px-16">
          <a
            href="#features"
            className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-200 transition hover:text-white"
          >
            <ArrowDown size={17} />
            Scroll to explore
          </a>

          <div className="max-w-[310px] rounded-2xl border border-white/20 bg-[#071b29]/75 px-5 py-4 backdrop-blur-xl">
            <p className="text-xs leading-6 text-slate-200">
              Different nations. Shared atmosphere.
              One interconnected climate future.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================
          THE BIGGER PICTURE
      ====================================== */}

      <section className="border-b border-white/10 bg-[#06121b] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a7edf0]">
              The bigger picture
            </p>

            <div className="mt-5 h-px w-16 bg-[#a7edf0]/70" />
          </div>

          <div>
            <h2 className="text-3xl font-semibold leading-[1.17] tracking-[-0.04em] sm:text-5xl">
              The climate does not recognize borders.

              <span className="text-slate-400">
                {" "}
                Our understanding should not stop at them.
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400">
              Beyond Borders Climate brings climate data
              into a clearer, more accessible experience.
              Explore national trends, investigate different
              perspectives, and translate information into
              better decisions.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================
          PLATFORM CAPABILITIES
      ====================================== */}

      <section
        id="features"
        className="bg-[#081923] px-6 py-24 sm:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-[1200px]">

          {/* SECTION HEADER */}
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a7edf0]">
              Explore the platform
            </p>

            <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
              From information to understanding.
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400">
              Explore a growing set of tools designed
              to help make climate information useful.
            </p>
          </div>

          {/* FEATURE CARDS */}
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  key={feature.title}
                  to={feature.path}
                  className="group flex min-h-[320px] flex-col rounded-2xl border border-white/10 bg-[#10232e] p-7 transition duration-200 hover:-translate-y-1 hover:border-[#a7edf0]/40 hover:bg-[#142b35] sm:p-9"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold tracking-[0.15em] text-[#a7edf0]">
                      {feature.label}
                    </span>

                    <ArrowUpRight
                      size={20}
                      className="text-slate-400 transition group-hover:text-[#a7edf0]"
                    />
                  </div>

                  <div className="mt-10">
                    <Icon
                      size={30}
                      strokeWidth={1.4}
                      className="text-[#a7edf0]"
                    />

                    <h3 className="mt-6 max-w-sm text-2xl font-semibold tracking-tight sm:text-3xl">
                      {feature.title}
                    </h3>

                    <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-10">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#a7edf0]">
                      {feature.action}
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================
          MISSION SECTION
      ====================================== */}

      <section
        id="mission"
        className="border-t border-white/10 bg-[#06121b] px-6 py-28 text-center sm:px-10"
      >
        <div className="mx-auto max-w-3xl">

          <Globe2
            size={42}
            strokeWidth={1.2}
            className="mx-auto text-[#a7edf0]"
          />

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.23em] text-[#a7edf0]">
            Our mission
          </p>

          <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-6xl">
            A shared planet needs
            a wider perspective.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-slate-400">
            Built around the belief that climate
            information should be understandable,
            accessible, and connected to real-world
            decisions.
          </p>

          {/* MISSION CTA — HIGH CONTRAST */}
          <Link
            to="/dashboard"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#b1edf0] px-8 py-4 text-sm font-bold !text-[#06121b] transition hover:bg-white hover:!text-[#06121b]"
          >
            Enter Beyond Borders
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="border-t border-white/10 bg-[#06121b] px-6 py-9 sm:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-5 text-sm text-slate-400 sm:flex-row sm:items-center">

          <div className="flex items-center gap-2">
            <Leaf
              size={19}
              className="text-[#a7edf0]"
            />

            <span className="font-semibold text-white">
              Beyond Borders Climate
            </span>
          </div>

          <span>
            Climate intelligence for a shared planet.
          </span>
        </div>
      </footer>
    </div>
  );
}
