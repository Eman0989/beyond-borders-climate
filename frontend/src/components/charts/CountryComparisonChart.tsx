
import { useMemo, useState } from "react";
import {
  BarChart3,
  Plus,
  X,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { CountryClimate } from "../../types/climate";

type Props = {
  countries: CountryClimate[];
};

type Metric = "total" | "perCapita";

const MAX_COUNTRIES = 5;

const DEFAULT_CODES = ["POL", "DEU", "PAK"];

export default function CountryComparisonChart({
  countries,
}: Props) {
  const [selectedCodes, setSelectedCodes] =
    useState<string[]>(DEFAULT_CODES);

  const [metric, setMetric] = useState<Metric>("total");

  const [countryToAdd, setCountryToAdd] = useState("");

  const selectedCountries = useMemo(
    () =>
      selectedCodes
        .map((code) =>
          countries.find((country) => country.code === code)
        )
        .filter(
          (country): country is CountryClimate =>
            country !== undefined
        ),
    [countries, selectedCodes]
  );

  // Find years where every selected country has
  // observations. Use the most recent common year.
  const commonYears = useMemo(() => {
    if (selectedCountries.length === 0) {
      return [];
    }

    const yearSets = selectedCountries.map(
      (country) =>
        new Set(
          country.history
            .filter(
              (record) =>
                metric === "total" ||
                record.emissionsPerCapita !== null
            )
            .map((record) => record.year)
        )
    );

    return [...yearSets[0]]
      .filter((year) =>
        yearSets.every((set) => set.has(year))
      )
      .sort((a, b) => b - a);
  }, [selectedCountries, metric]);

  const comparisonYear = commonYears[0];

  const chartData = useMemo(() => {
    if (comparisonYear === undefined) {
      return [];
    }

    return selectedCountries.flatMap((country) => {
      const record = country.history.find(
        (item) => item.year === comparisonYear
      );

      if (!record) return [];

      const value =
        metric === "total"
          ? record.emissions
          : record.emissionsPerCapita;

      if (value === null) return [];

      return [
        {
          code: country.code,
          name: country.name,
          value,
        },
      ];
    });
  }, [selectedCountries, comparisonYear, metric]);

  const availableCountries = countries
    .filter(
      (country) =>
        !selectedCodes.includes(country.code)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  function addCountry() {
    if (
      !countryToAdd ||
      selectedCodes.includes(countryToAdd) ||
      selectedCodes.length >= MAX_COUNTRIES
    ) {
      return;
    }

    setSelectedCodes((previous) => [
      ...previous,
      countryToAdd,
    ]);

    setCountryToAdd("");
  }

  function removeCountry(code: string) {
    setSelectedCodes((previous) =>
      previous.filter((item) => item !== code)
    );
  }

  const isPerCapita = metric === "perCapita";

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0d1e19] p-5 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3
              size={20}
              className="text-emerald-400"
            />

            <h3 className="text-lg font-semibold">
              Country Comparison
            </h3>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Compare countries using the same reporting year.
          </p>
        </div>

        {comparisonYear !== undefined && (
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
            {comparisonYear}
          </span>
        )}
      </div>

      {/* METRIC SELECTOR */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMetric("total")}
          aria-pressed={!isPerCapita}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
            !isPerCapita
              ? "bg-emerald-400 text-[#071310]"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          Total CO₂
        </button>

        <button
          type="button"
          onClick={() => setMetric("perCapita")}
          aria-pressed={isPerCapita}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
            isPerCapita
              ? "bg-emerald-400 text-[#071310]"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          CO₂ Per Capita
        </button>
      </div>

      {/* SELECTED COUNTRIES */}
      <div className="mb-5 flex flex-wrap gap-2">
        {selectedCountries.map((country) => (
          <div
            key={country.code}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
          >
            <span>{country.name}</span>

            <button
              type="button"
              onClick={() => removeCountry(country.code)}
              aria-label={`Remove ${country.name}`}
              className="text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ADD COUNTRY */}
      <div className="mb-7 flex flex-wrap gap-2">
        <select
          aria-label="Choose country to compare"
          value={countryToAdd}
          onChange={(event) =>
            setCountryToAdd(event.target.value)
          }
          disabled={selectedCodes.length >= MAX_COUNTRIES}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#10241d] px-3 py-2.5 text-sm text-white focus:border-emerald-400"
        >
          <option value="">Select another country</option>

          {availableCountries.map((country) => (
            <option
              key={country.code}
              value={country.code}
            >
              {country.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={addCountry}
          disabled={
            !countryToAdd ||
            selectedCodes.length >= MAX_COUNTRIES
          }
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-[#071310] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={17} />
          Add
        </button>
      </div>

      {/* CHART */}
      {chartData.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 5,
                right: 20,
                bottom: 5,
                left: 5,
              }}
            >
              <CartesianGrid
                stroke="#ffffff15"
                horizontal={false}
              />

              <XAxis
                type="number"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                width={85}
                fontSize={11}
              />

              <Tooltip
                cursor={{ fill: "#ffffff08" }}
                contentStyle={{
                  backgroundColor: "#10241d",
                  border: "1px solid #ffffff20",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
                formatter={(value) => [
                  `${Number(value).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })} ${
                    isPerCapita ? "t CO₂/person" : "Mt CO₂"
                  }`,
                  isPerCapita
                    ? "Per-capita emissions"
                    : "Total emissions",
                ]}
              />

              <Bar
                dataKey="value"
                fill="#34d399"
                radius={[0, 6, 6, 0]}
                barSize={26}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
          {selectedCountries.length === 0
            ? "Select at least one country to begin."
            : "No common reporting year is available for the selected countries and metric."}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-xs text-slate-400">
          {isPerCapita
            ? "Unit: tonnes of CO₂ per person"
            : "Unit: million tonnes of CO₂"}
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Source: Our World in Data.
          Territorial fossil-fuel and industrial CO₂
          emissions, excluding land-use change.
          Comparisons use the latest year shared by
          all selected countries.
        </p>
      </div>
    </div>
  );
}
