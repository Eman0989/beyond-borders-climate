
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Database,
  ExternalLink,
  GitCompareArrows,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { useClimateData } from "../hooks/useClimateData";
import type { CountryClimate } from "../types/climate";

type Metric = "total" | "perCapita";

const COLORS = ["#34d399", "#60a5fa", "#fbbf24"];

const DEFAULT_COUNTRIES = ["POL", "DEU", "PAK"];

function getValue(
  record: CountryClimate["history"][number],
  metric: Metric
): number | null {
  return metric === "total"
    ? record.emissions
    : record.emissionsPerCapita;
}

function formatValue(
  value: number | null | undefined,
  metric: Metric
): string {
  if (value == null) return "N/A";

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return metric === "total"
    ? `${formatted} Mt`
    : `${formatted} t`;
}

export default function Compare() {
  const { countries, loading, error } = useClimateData();

  const [selectedCodes, setSelectedCodes] =
    useState<string[]>(DEFAULT_COUNTRIES);

  const [metric, setMetric] = useState<Metric>("total");

  const [requestedYear, setRequestedYear] =
    useState<number | null>(null);

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

  // Years must have values for every selected country.
  const commonYears = useMemo(() => {
    if (selectedCountries.length === 0) return [];

    const yearSets = selectedCountries.map(
      (country) =>
        new Set(
          country.history
            .filter((record) => getValue(record, metric) !== null)
            .map((record) => record.year)
        )
    );

    return [...yearSets[0]]
      .filter((year) =>
        yearSets.every((set) => set.has(year))
      )
      .sort((a, b) => a - b);
  }, [selectedCountries, metric]);

  const year =
    requestedYear !== null && commonYears.includes(requestedYear)
      ? requestedYear
      : commonYears[commonYears.length - 1];

  // Build a chart with all available historical years.
  // Missing values are left as null, never interpolated.
  const chartData = useMemo(() => {
    const allYears = new Set<number>();

    selectedCountries.forEach((country) => {
      country.history.forEach((record) => {
        allYears.add(record.year);
      });
    });

    return [...allYears]
      .sort((a, b) => a - b)
      .map((currentYear) => {
        const row: Record<string, number | null> = {
          year: currentYear,
        };

        selectedCountries.forEach((country) => {
          const record = country.history.find(
            (item) => item.year === currentYear
          );

          row[country.code] = record
            ? getValue(record, metric)
            : null;
        });

        return row;
      });
  }, [selectedCountries, metric]);

  const comparison = useMemo(() => {
    if (year === undefined) return [];

    return selectedCountries.map((country) => {
      const currentRecord = country.history.find(
        (record) => record.year === year
      );

      const currentValue = currentRecord
        ? getValue(currentRecord, metric)
        : null;

      const firstRecord = country.history.find(
        (record) =>
          record.year === commonYears[0]
      );

      const firstValue = firstRecord
        ? getValue(firstRecord, metric)
        : null;

      const change =
        currentValue !== null &&
        firstValue !== null &&
        firstValue > 0
          ? ((currentValue - firstValue) / firstValue) * 100
          : null;

      return {
        ...country,
        currentValue,
        change,
      };
    });
  }, [selectedCountries, year, metric, commonYears]);

  function updateCountry(index: number, code: string) {
    if (
      code &&
      selectedCodes.some(
        (existing, i) => existing === code && i !== index
      )
    ) {
      return;
    }

    setSelectedCodes((previous) =>
      previous.map((existing, i) =>
        i === index ? code : existing
      )
    );

    setRequestedYear(null);
  }

  function addCountry() {
    if (selectedCodes.length >= 3) return;

    const firstAvailable = countries.find(
      (country) => !selectedCodes.includes(country.code)
    );

    if (firstAvailable) {
      setSelectedCodes((previous) => [
        ...previous,
        firstAvailable.code,
      ]);
      setRequestedYear(null);
    }
  }

  function removeCountry(index: number) {
    setSelectedCodes((previous) =>
      previous.filter((_, i) => i !== index)
    );
    setRequestedYear(null);
  }

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[70vh] items-center justify-center gap-3 text-emerald-400"
      >
        <RefreshCw className="animate-spin" size={25} />
        Loading country comparisons...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-8"
      >
        <h2 className="text-xl font-semibold text-rose-300">
          Unable to load comparison data
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          {error}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-[#071310]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <Link
          to="/dashboard"
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
          <GitCompareArrows size={18} />
          Global Emissions Analysis
        </div>

        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Compare Countries
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Analyze territorial CO₂ emissions across countries.
          Compare historical trends, emissions per person,
          and changes over time.
        </p>
      </div>

      {/* CONTROLS */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6">
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-emerald-400" />
          <h2 className="text-lg font-semibold">
            Comparison Settings
          </h2>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            aria-pressed={metric === "total"}
            onClick={() => {
              setMetric("total");
              setRequestedYear(null);
            }}
            className={`rounded-xl px-5 py-3 text-sm font-medium ${
              metric === "total"
                ? "bg-emerald-400 text-[#071310]"
                : "border border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            Total CO₂ Emissions
          </button>

          <button
            type="button"
            aria-pressed={metric === "perCapita"}
            onClick={() => {
              setMetric("perCapita");
              setRequestedYear(null);
            }}
            className={`rounded-xl px-5 py-3 text-sm font-medium ${
              metric === "perCapita"
                ? "bg-emerald-400 text-[#071310]"
                : "border border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            CO₂ Per Capita
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {selectedCodes.map((code, index) => (
            <div key={index}>
              <label
                htmlFor={`comparison-country-${index}`}
                className="mb-2 block text-xs text-slate-400"
              >
                Country {index + 1}
              </label>

              <div className="flex gap-2">
                <select
                  id={`comparison-country-${index}`}
                  value={code}
                  onChange={(event) =>
                    updateCountry(index, event.target.value)
                  }
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#10241d] px-3 py-3 text-sm text-white"
                >
                  {countries.map((country) => (
                    <option
                      key={country.code}
                      value={country.code}
                      disabled={
                        selectedCodes.includes(country.code) &&
                        country.code !== code
                      }
                    >
                      {country.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  aria-label={`Remove country ${index + 1}`}
                  onClick={() => removeCountry(index)}
                  className="rounded-xl border border-white/10 px-3 text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedCodes.length < 3 && (
          <button
            type="button"
            onClick={addCountry}
            className="mt-5 rounded-xl border border-emerald-400/30 px-5 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-400/10"
          >
            + Add Country
          </button>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CalendarDays size={17} />
            Reporting year
          </div>

          <select
            aria-label="Comparison reporting year"
            value={year ?? ""}
            disabled={commonYears.length === 0}
            onChange={(event) =>
              setRequestedYear(Number(event.target.value))
            }
            className="rounded-xl border border-white/10 bg-[#10241d] px-4 py-2.5 text-sm text-white"
          >
            {commonYears.length === 0 && (
              <option value="">Unavailable</option>
            )}

            {[...commonYears].reverse().map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500">
            Only years shared by all selected countries
          </span>
        </div>
      </div>

      {/* HISTORICAL COMPARISON CHART */}
      <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0d1e19] p-5 sm:p-7">
        <h2 className="text-xl font-semibold">
          Historical Emissions Trends
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          {metric === "total"
            ? "Annual emissions in million tonnes of CO₂"
            : "Annual emissions in tonnes of CO₂ per person"}
        </p>

        {selectedCountries.length > 0 ? (
          <div className="mt-8 h-[360px] w-full sm:h-[430px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  stroke="#ffffff15"
                  vertical={false}
                />

                <XAxis
                  dataKey="year"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={55}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#10241d",
                    border: "1px solid #ffffff20",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  formatter={(value, name) => [
                    formatValue(
                      value == null ? null : Number(value),
                      metric
                    ),
                    String(name),
                  ]}
                  labelFormatter={(label) =>
                    `Year ${label}`
                  }
                />

                <Legend verticalAlign="bottom" height={36} />

                {selectedCountries.map((country, index) => (
                  <Line
                    key={country.code}
                    type="linear"
                    dataKey={country.code}
                    name={country.name}
                    stroke={COLORS[index]}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-8 flex h-[360px] items-center justify-center text-sm text-slate-400">
            Select a country to display historical data.
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Missing observations are not interpolated.
          Each line shows available annual records.
        </p>
      </div>

      {/* COUNTRY COMPARISON CARDS */}
      <div>
        <h2 className="mb-5 text-xl font-semibold">
          Country Analysis
        </h2>

        {year === undefined && selectedCountries.length > 0 && (
          <p className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">
            There is no common reporting year for the
            selected metric and countries.
          </p>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          {comparison.map((country, index) => (
            <div
              key={country.code}
              className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {country.name}
                </h3>

                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
              </div>

              <p className="text-xs text-slate-400">
                Emissions · {year}
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {formatValue(country.currentValue, metric)}
              </p>

              <div className="my-6 border-t border-white/10" />

              <p className="text-xs text-slate-400">
                Change since {commonYears[0]}
              </p>

              {country.change !== null ? (
                <div className="mt-3 flex items-center gap-2">
                  {country.change < 0 ? (
                    <TrendingDown
                      size={20}
                      className="text-emerald-400"
                    />
                  ) : (
                    <TrendingUp
                      size={20}
                      className="text-amber-400"
                    />
                  )}

                  <span className="text-xl font-semibold">
                    {country.change > 0 ? "+" : ""}
                    {country.change.toFixed(1)}%
                  </span>
                </div>
              ) : (
                <p className="mt-3 text-slate-400">N/A</p>
              )}

              <p className="mt-5 text-xs text-slate-500">
                Source: {country.dataSource}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* METHODOLOGY */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-7">
        <div className="mb-5 flex items-center gap-3">
          <Database size={20} className="text-emerald-400" />
          <h2 className="text-lg font-semibold">
            Data Sources & Methodology
          </h2>
        </div>

        <p className="text-sm leading-7 text-slate-400">
          Historical emissions data is sourced from Our World
          in Data's CO₂ and Greenhouse Gas Emissions dataset.
          Total emissions represent territorial fossil-fuel
          and industrial CO₂ emissions, excluding land-use
          change. Per-capita emissions are measured in
          tonnes of CO₂ per person.
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Reporting years may differ between countries.
          Numerical country comparisons use only years
          with observations for every selected country.
          Historical trends preserve missing observations
          rather than estimating them.
        </p>

        <a
          href="https://github.com/owid/co2-data"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          View original data and methodology
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
