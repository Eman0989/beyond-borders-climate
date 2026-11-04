
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Factory,
  Globe2,
  Leaf,
  RefreshCw,
  Thermometer,
  ExternalLink,
  Database,
  CalendarDays,
} from "lucide-react";

import MetricCard from "../components/ui/MetricCard";
import EmissionsChart from "../components/charts/EmissionsChart";
import CountryComparisonChart from "../components/charts/CountryComparisonChart";
import { useClimateData } from "../hooks/useClimateData";

// Format numbers consistently across the dashboard
function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Handle unavailable numerical indicators
function formatNullable(
  value: number | null,
  unit: string,
  decimals = 2
): string {
  return value === null
    ? "N/A"
    : `${formatNumber(value, decimals)}${unit}`;
}

export default function Dashboard() {
  const { countries, loading, error } = useClimateData();

  const [selectedCode, setSelectedCode] = useState("POL");

  const country =
    countries.find((item) => item.code === selectedCode) ??
    countries[0];

  // ====================================
  // LOADING STATE
  // ====================================

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[70vh] flex-col items-center justify-center gap-4"
      >
        <RefreshCw
          size={32}
          className="animate-spin text-emerald-400"
        />

        <p className="text-slate-400">
          Loading verified climate data...
        </p>
      </div>
    );
  }

  // ====================================
  // API ERROR STATE
  // ====================================

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-8"
      >
        <h2 className="text-xl font-semibold text-rose-300">
          Unable to connect to the climate API
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          {error}
        </p>

        <p className="mt-4 text-sm text-slate-400">
          Make sure your FastAPI backend is running at
          http://127.0.0.1:8000.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-[#071310] transition hover:bg-emerald-300"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // ====================================
  // EMPTY DATA STATE
  // ====================================

  if (!country) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-white/10 bg-[#0d1e19] p-8 text-slate-400"
      >
        No climate country data is currently available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
            <Activity size={16} />
            Climate Overview
          </div>

          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Climate Intelligence
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Explore real country-level CO₂ emissions,
            historical trends, and climate indicators
            from Our World in Data.
          </p>
        </div>

        {/* COUNTRY SELECTOR */}
        <div>
          <label
            htmlFor="country"
            className="mb-2 block text-xs text-slate-400"
          >
            Select country
          </label>

          <select
            id="country"
            value={country.code}
            onChange={(event) =>
              setSelectedCode(event.target.value)
            }
            className="min-w-48 max-w-full rounded-xl border border-white/10 bg-[#10241d] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
          >
            {countries.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ====================================
          DATA SOURCE INFORMATION
      ==================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <Database
            size={21}
            className="mt-0.5 shrink-0 text-emerald-400"
          />

          <div>
            <p className="font-medium text-emerald-300">
              Climate dataset connected
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              {country.name} · {country.year} ·
              Territorial fossil-fuel and industrial CO₂ emissions
            </p>
          </div>
        </div>

        <a
          href={country.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline underline-offset-4 transition hover:text-emerald-300"
        >
          View Data Source
          <ExternalLink size={15} />
        </a>
      </div>

      {/* ====================================
          KPI METRIC CARDS
      ==================================== */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Annual CO₂ Emissions"
          value={`${formatNumber(country.emissions)} Mt`}
          description={`Million tonnes of CO₂ · ${country.year}`}
          icon={Factory}
        />

        <MetricCard
          title="Emissions Per Capita"
          value={formatNullable(
            country.emissionsPerCapita,
            " t"
          )}
          description={`Tonnes of CO₂ per person · ${country.year}`}
          icon={Globe2}
        />

        <MetricCard
          title="Renewable Share"
          value={formatNullable(
            country.renewableShare,
            "%",
            1
          )}
          description="Awaiting a verified energy dataset"
          icon={Leaf}
        />

        <MetricCard
          title="Temperature Change"
          value={formatNullable(
            country.temperatureChange,
            "°C"
          )}
          description="Awaiting a verified temperature dataset"
          icon={Thermometer}
        />
      </div>

      {/* ====================================
          EMISSIONS VISUALIZATIONS
      ==================================== */}

      <div className="grid gap-5 xl:grid-cols-2">
        <EmissionsChart
          data={country.history}
          country={country.name}
        />

        <CountryComparisonChart countries={countries} />
      </div>

      {/* ====================================
          COUNTRY CLIMATE PROFILE
      ==================================== */}

      <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-7">
        <div className="mb-6 flex items-center gap-3">
          <Globe2
            size={23}
            className="text-emerald-400"
          />

          <h2 className="text-xl font-semibold">
            {country.name} Climate Profile
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Globe2 size={15} />
              Country Code
            </div>

            <p className="mt-2 text-lg font-medium">
              {country.code}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays size={15} />
              Reporting Year
            </div>

            <p className="mt-2 text-lg font-medium">
              {country.year}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Database size={15} />
              Data Source
            </div>

            <p className="mt-2 text-lg font-medium">
              {country.dataSource}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Activity size={15} />
              Historical Records
            </div>

            <p className="mt-2 text-lg font-medium">
              {country.history.length} years
            </p>
          </div>
        </div>

        {/* METHODOLOGY */}
        <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold text-slate-200">
            Understanding this dataset
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Annual CO₂ emissions represent territorial
            emissions from fossil fuels and industrial
            processes. They exclude land-use change.
            Values are reported in million tonnes of CO₂,
            while per-capita figures are measured in
            tonnes per person.
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Dataset status: {country.dataStatus}.
            The latest available year may differ between countries.
          </p>
        </div>
      </div>

      {/* ====================================
          CLIMATE EXPLORER + QUICK ACTIONS
      ==================================== */}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* INTERACTIVE GLOBE PREVIEW */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-7 lg:col-span-2">
          <div className="flex items-center gap-3">
            <BarChart3
              size={22}
              className="text-emerald-400"
            />

            <h3 className="text-xl font-semibold">
              Global Climate Explorer
            </h3>
          </div>

          <p className="mt-4 max-w-xl leading-7 text-slate-400">
            Explore country-level CO₂ emissions
            through an interactive 3D globe.
            Select countries to examine their
            historical climate data and trends.
          </p>

          <div className="mt-8 flex min-h-48 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/5">
            <Globe2
              size={85}
              strokeWidth={0.9}
              className="text-emerald-400/70"
            />
          </div>

          <Link
            to="/explorer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
          >
            Open Interactive Globe
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* CLIMATE ACTION TOOLS */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-7">
          <h3 className="text-xl font-semibold">
            Climate Action Tools
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Explore the platform's climate intelligence
            and sustainability tools.
          </p>

          <div className="mt-7 space-y-3">
            {[
              {
                title: "SME Climate Simulator",
                description: "Model business emissions",
                path: "/simulator",
                icon: Factory,
              },
              {
                title: "Country Comparison",
                description: "Compare national indicators",
                path: "/compare",
                icon: Globe2,
              },
              {
                title: "AI Policy Assistant",
                description: "Understand climate policies",
                path: "/assistant",
                icon: BrainCircuit,
              },
            ].map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-sm transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
                >
                  <div className="rounded-lg bg-emerald-400/10 p-3">
                    <Icon
                      size={20}
                      className="text-emerald-400"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {tool.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {tool.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={16}
                    className="shrink-0 text-slate-500"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <p className="pb-4 text-center text-xs text-slate-600">
        Beyond Borders Climate · Climate Intelligence Platform
      </p>
    </div>
  );
}
