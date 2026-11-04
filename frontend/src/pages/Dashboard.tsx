
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
} from "lucide-react";

import MetricCard from "../components/ui/MetricCard";
import EmissionsChart from "../components/charts/EmissionsChart";
import CountryComparisonChart from "../components/charts/CountryComparisonChart";
import { useClimateData } from "../hooks/useClimateData";

export default function Dashboard() {
  const { countries, loading, error } = useClimateData();
  const [selectedCode, setSelectedCode] = useState("POL");

  const country =
    countries.find((item) => item.code === selectedCode) ??
    countries[0];

  // Loading state
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
          Loading climate intelligence...
        </p>
      </div>
    );
  }

  // API error state
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
          Make sure FastAPI is running at http://127.0.0.1:8000.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-[#071310]"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Empty response state
  if (!country) {
    return (
      <div role="status" className="p-8 text-slate-400">
        No climate country data is currently available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
            <Activity size={16} />
            Climate Overview
          </div>

          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Climate Intelligence
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Explore emissions, energy indicators and country trends.
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
            className="min-w-48 rounded-xl border border-white/10 bg-[#10241d] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
          >
            {countries.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DATA DISCLAIMER */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-5 py-4">
        <p className="text-sm text-amber-200">
          Connected to FastAPI. Climate figures are still synthetic
          demonstration values, not verified statistics.
        </p>

        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          API Connected
        </span>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Annual CO₂ Emissions"
          value={`${country.emissions} Mt`}
          description="Synthetic million tonnes of CO₂"
          icon={Factory}
        />

        <MetricCard
          title="Emissions Per Capita"
          value={`${country.emissionsPerCapita} t`}
          description="Synthetic tonnes per person"
          icon={Globe2}
        />

        <MetricCard
          title="Renewable Share"
          value={`${country.renewableShare}%`}
          description="Illustrative energy share"
          icon={Leaf}
        />

        <MetricCard
          title="Temperature Change"
          value={`+${country.temperatureChange}°C`}
          description="Synthetic value; baseline undefined"
          icon={Thermometer}
        />
      </div>

      {/* CHARTS */}
      <div className="grid gap-5 xl:grid-cols-2">
        <EmissionsChart
          data={country.history}
          country={country.name}
        />

        <CountryComparisonChart countries={countries} />
      </div>

      {/* COUNTRY DETAILS */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-7">
        <div className="mb-5 flex items-center gap-3">
          <Globe2 size={23} className="text-emerald-400" />
          <h2 className="text-xl font-semibold">
            {country.name} Climate Profile
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">Country Code</p>
            <p className="mt-2 font-medium">{country.code}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Data Status</p>
            <p className="mt-2 font-medium">
              {country.dataStatus}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Data Source</p>
            <p className="mt-2 font-medium">
              {country.dataSource}
            </p>
          </div>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* EXPLORER */}
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
            Explore country-level climate information through
            our interactive 3D Earth visualization.
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
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400"
          >
            Open Interactive Globe
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-7">
          <h3 className="text-xl font-semibold">
            Climate Action Tools
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Explore additional platform capabilities.
          </p>

          <div className="mt-7 space-y-3">
            {[
              {
                title: "SME Climate Simulator",
                path: "/simulator",
                icon: Factory,
              },
              {
                title: "Country Comparison",
                path: "/compare",
                icon: Globe2,
              },
              {
                title: "AI Policy Assistant",
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
                  <Icon size={20} className="text-emerald-400" />
                  <span className="flex-1">{tool.title}</span>
                  <ArrowRight
                    size={16}
                    className="text-slate-500"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <p className="pb-4 text-center text-xs text-slate-600">
        Beyond Borders Climate · API-Connected Development Preview
      </p>
    </div>
  );
}
