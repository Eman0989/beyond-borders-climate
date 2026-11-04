
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Earth,
  Globe2,
  Info,
  MapPin,
  RefreshCw,
} from "lucide-react";

import ClimateGlobe from "../components/globe/ClimateGlobe";
import { useClimateData } from "../hooks/useClimateData";

export default function ClimateExplorer() {
  const { countries, loading, error } = useClimateData();

  const [selectedCode, setSelectedCode] = useState("POL");
  const [selectedName, setSelectedName] = useState("Poland");

  const selectedClimate = countries.find(
    (country) => country.code === selectedCode
  );

  function selectCountry(code: string, name: string) {
    setSelectedCode(code);
    setSelectedName(name);
  }

  return (
    <div className="space-y-7">
      {/* PAGE HEADER */}
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
          Explore geographic boundaries and country-level
          climate indicators through an interactive 3D globe.
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* 3D GLOBE */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1e19]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <Globe2 size={21} className="text-emerald-400" />
              <h2 className="font-semibold">
                Interactive Earth
              </h2>
            </div>

            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              3D
            </span>
          </div>

          <ClimateGlobe
            selectedCountry={selectedCode}
            onCountrySelect={selectCountry}
          />
        </div>

        {/* COUNTRY INFORMATION */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6">
            <div className="mb-6 flex items-center gap-2 text-sm text-emerald-400">
              <MapPin size={17} />
              Selected Country
            </div>

            <h2 className="text-3xl font-semibold">
              {selectedName}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              ISO Code: {selectedCode}
            </p>

            <div className="my-6 border-t border-white/10" />

            {/* LOADING STATE */}
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
              /* API ERROR */
              <div
                role="alert"
                className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-4"
              >
                <p className="text-sm text-rose-300">
                  Could not load climate data.
                </p>

                <p className="mt-2 break-words text-xs text-slate-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm font-medium text-emerald-400"
                >
                  Retry
                </button>
              </div>
            ) : selectedClimate ? (
              /* COUNTRY CLIMATE DATA */
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-slate-400">
                    Annual CO₂ Emissions
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {selectedClimate.emissions} Mt
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Emissions Per Capita
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {selectedClimate.emissionsPerCapita} t
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Renewable Energy Share
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-emerald-400">
                    {selectedClimate.renewableShare}%
                  </p>
                </div>

                <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
                  <p className="text-xs leading-5 text-amber-200">
                    These figures are synthetic demonstration
                    data returned by FastAPI, not verified
                    climate statistics.
                  </p>
                </div>
              </div>
            ) : (
              /* MISSING CLIMATE DATA */
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-400">
                Geographic information is available,
                but climate indicators have not been
                connected for this country yet.
              </div>
            )}
          </div>

          {/* COUNTRY SHORTCUTS */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6">
            <h3 className="mb-4 font-semibold">
              Explore Countries
            </h3>

            <div className="space-y-2">
              {countries.map((country) => (
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
                  {country.name}
                </button>
              ))}
            </div>
          </div>

          {/* INFORMATION */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-5">
            <div className="flex items-start gap-3">
              <Info
                size={18}
                className="mt-0.5 shrink-0 text-emerald-400"
              />

              <p className="text-xs leading-6 text-slate-400">
                Geographic country boundaries are loaded
                separately from the climate API. Verified
                climate datasets will be integrated in
                the next development phase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
