
import {
  lazy,
  Suspense,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Earth,
  ExternalLink,
  Globe2,
  Info,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";

import { useClimateData } from "../hooks/useClimateData";

// Load the 3D rendering engine only when needed
const ClimateGlobe = lazy(
  () => import("../components/globe/ClimateGlobe")
);

// Format real climate indicators
function formatValue(
  value: number | null,
  unit: string
): string {
  if (value === null) return "N/A";

  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${unit}`;
}

export default function ClimateExplorer() {
  const { countries, loading, error } = useClimateData();

  const [selectedCode, setSelectedCode] = useState("POL");
  const [selectedName, setSelectedName] = useState("Poland");
  const [search, setSearch] = useState("");

  // The 3D engine is initially disabled
  const [globeEnabled, setGlobeEnabled] = useState(false);

  const selectedClimate = countries.find(
    (country) => country.code === selectedCode
  );

  // Show a few shortcuts by default.
  // Search returns up to 12 matching countries.
  const filteredCountries = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return countries.filter((country) =>
        ["POL", "DEU", "PAK"].includes(country.code)
      );
    }

    return countries
      .filter(
        (country) =>
          country.name.toLowerCase().includes(term) ||
          country.code.toLowerCase().includes(term)
      )
      .slice(0, 12);
  }, [countries, search]);

  function selectCountry(code: string, name: string) {
    setSelectedCode(code);
    setSelectedName(name);
  }

  return (
    <div className="space-y-7">
      {/* ==================================
          HEADER
      ================================== */}
      <div>
        <Link
          to="/dashboard"
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
          <Earth size={17} />
          Global Climate Explorer
        </div>

        <h1 className="text-3xl font-semibold md:text-4xl">
          Explore Our Planet
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Explore real territorial CO₂ emissions
          through an interactive 3D Earth visualization.
        </p>
      </div>

      {/* ==================================
          MAIN CONTENT
      ================================== */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* 3D GLOBE CONTAINER */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1e19]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <Globe2
                size={21}
                className="text-emerald-400"
              />

              <h2 className="font-semibold">
                Interactive Earth
              </h2>
            </div>

            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              3D
            </span>
          </div>

          {/* ON-DEMAND 3D GLOBE */}
          {globeEnabled ? (
            <Suspense
              fallback={
                <div
                  role="status"
                  className="flex h-[420px] items-center justify-center bg-[#06110e] sm:h-[520px] lg:h-[650px]"
                >
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />

                    <p className="text-sm text-emerald-300">
                      Initializing 3D Earth...
                    </p>
                  </div>
                </div>
              }
            >
              <ClimateGlobe
                selectedCountry={selectedCode}
                onCountrySelect={selectCountry}
              />
            </Suspense>
          ) : (
            <div className="flex h-[420px] flex-col items-center justify-center gap-5 bg-[#06110e] px-6 text-center sm:h-[520px] lg:h-[650px]">
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 p-6">
                <Globe2
                  size={55}
                  strokeWidth={1.2}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white">
                  Interactive Climate Globe
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
                  Explore countries in 3D with real climate
                  data. The rendering engine loads only
                  when you activate the globe.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGlobeEnabled(true)}
                className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#071310] transition hover:bg-emerald-300"
              >
                Launch Interactive Globe
              </button>
            </div>
          )}
        </div>

        {/* ==================================
            COUNTRY SIDE PANEL
        ================================== */}
        <div className="space-y-5">
          {/* COUNTRY INFORMATION */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6">
            <div className="mb-6 flex items-center gap-2 text-sm text-emerald-400">
              <MapPin size={17} />
              Selected Country
            </div>

            <h2 className="text-2xl font-semibold">
              {selectedClimate?.name ?? selectedName}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              ISO Code: {selectedCode}
            </p>

            <div className="my-6 border-t border-white/10" />

            {loading ? (
              <div
                role="status"
                className="flex items-center gap-3 text-slate-400"
              >
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />

                Loading climate data...
              </div>
            ) : error ? (
              <div
                role="alert"
                className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-4"
              >
                <p className="text-sm text-rose-300">
                  Unable to load climate data.
                </p>

                <p className="mt-2 break-words text-xs text-slate-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm font-medium text-emerald-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : selectedClimate ? (
              <div className="space-y-5">
                {/* TOTAL EMISSIONS */}
                <div>
                  <p className="text-xs text-slate-400">
                    Annual CO₂ Emissions
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {formatValue(
                      selectedClimate.emissions,
                      "Mt"
                    )}
                  </p>
                </div>

                {/* PER-CAPITA EMISSIONS */}
                <div>
                  <p className="text-xs text-slate-400">
                    Emissions Per Capita
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {formatValue(
                      selectedClimate.emissionsPerCapita,
                      "t"
                    )}
                  </p>
                </div>

                {/* RENEWABLE SHARE */}
                <div>
                  <p className="text-xs text-slate-400">
                    Renewable Energy Share
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-emerald-400">
                    {selectedClimate.renewableShare === null
                      ? "N/A"
                      : `${selectedClimate.renewableShare.toFixed(1)}%`}
                  </p>
                </div>

                {/* VERIFIED DATA METADATA */}
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                  <p className="text-sm font-medium text-emerald-300">
                    Data: {selectedClimate.year}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Source: {selectedClimate.dataSource}.
                    Territorial fossil-fuel and industrial
                    CO₂ emissions, excluding land-use change.
                  </p>

                  <a
                    href={selectedClimate.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:underline"
                  >
                    View dataset
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-400">
                No emissions observation is available
                for this selected location.
              </div>
            )}
          </div>

          {/* ==================================
              COUNTRY SEARCH
          ================================== */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6">
            <h3 className="mb-4 font-semibold">
              Explore Countries
            </h3>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search name or ISO code"
                aria-label="Search countries"
                className="w-full rounded-xl border border-white/10 bg-[#10241d] py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div className="mt-4 max-h-[300px] space-y-2 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() =>
                    selectCountry(country.code, country.name)
                  }
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                    selectedCode === country.code
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <span>{country.name}</span>

                  <span className="ml-2 text-xs opacity-60">
                    {country.code}
                  </span>
                </button>
              ))}

              {filteredCountries.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-500">
                  No countries found.
                </p>
              )}
            </div>
          </div>

          {/* ==================================
              INFORMATION
          ================================== */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-5">
            <div className="flex items-start gap-3">
              <Info
                size={18}
                className="mt-0.5 shrink-0 text-emerald-400"
              />

              <p className="text-xs leading-6 text-slate-400">
                Geographic boundaries and climate statistics
                come from separate sources. Country codes
                are used to match locations to emissions data.
                Some locations may not have a matching record.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
