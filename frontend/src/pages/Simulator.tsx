
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Database,
  ExternalLink,
  Factory,
  Leaf,
  LoaderCircle,
  Wallet,
  Zap,
} from "lucide-react";

import { simulatorApi } from "../services/api";
import { useClimateData } from "../hooks/useClimateData";

import type {
  Currency,
  SimulationResponse,
} from "../types/simulator";

const FALLBACK_COUNTRIES = [
  { code: "POL", name: "Poland" },
  { code: "DEU", name: "Germany" },
  { code: "PAK", name: "Pakistan" },
];

function numberFormat(value: number, digits = 2) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#10241d] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-300";

export default function Simulator() {
  const { countries } = useClimateData();

  const [countryCode, setCountryCode] = useState("POL");
  const [electricity, setElectricity] = useState("10000");
  const [price, setPrice] = useState("0.90");
  const [reduction, setReduction] = useState(20);
  const [currency, setCurrency] =
    useState<Currency>("PLN");

  const [useCustomFactor, setUseCustomFactor] =
    useState(false);
  const [customFactor, setCustomFactor] =
    useState("");

  const [result, setResult] =
    useState<SimulationResponse | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Currently Poland is the only country
  // with an implemented verified default factor.
  const needsCustomFactor =
    countryCode !== "POL" || useCustomFactor;

  const countryOptions =
    countries.length > 0
      ? countries
      : FALLBACK_COUNTRIES;

  function changeInputs() {
    setResult(null);
    setError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const annualKwh = Number(electricity);
    const electricityPrice = Number(price);

    if (
      electricity.trim() === "" ||
      !Number.isFinite(annualKwh) ||
      annualKwh < 0 ||
      annualKwh > 1_000_000_000
    ) {
      setError("Enter a valid annual electricity consumption.");
      return;
    }

    if (
      price.trim() === "" ||
      !Number.isFinite(electricityPrice) ||
      electricityPrice < 0
    ) {
      setError("Enter a valid electricity price.");
      return;
    }

    let factor: number | undefined;

    if (needsCustomFactor) {
      factor = Number(customFactor);

      if (
        customFactor.trim() === "" ||
        !Number.isFinite(factor) ||
        factor < 0 ||
        factor > 5
      ) {
        setError(
          "Enter an electricity emissions factor between 0 and 5 kg/kWh."
        );
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await simulatorApi.calculate({
        country_code: countryCode,
        annual_electricity_kwh: annualKwh,
        electricity_price_per_kwh: electricityPrice,
        reduction_percentage: reduction,
        currency,
        ...(factor !== undefined
          ? {
              emission_factor_kg_co2e_per_kwh: factor,
            }
          : {}),
      });

      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Simulation failed. Check your connection."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const currencySymbol: Record<Currency, string> = {
    PLN: "PLN",
    EUR: "EUR",
    USD: "USD",
  };

  return (
    <div className="space-y-8">
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
          <Calculator size={18} />
          Business Climate Intelligence
        </div>

        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          SME Climate Simulator
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Estimate electricity-related emissions,
          explore energy reduction scenarios,
          and understand potential electricity cost savings.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* INPUT PANEL */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-[#0d1e19] p-6 sm:p-7"
        >
          <div className="flex items-center gap-3">
            <Factory
              size={22}
              className="text-emerald-400"
            />

            <h2 className="text-xl font-semibold">
              Business Inputs
            </h2>
          </div>

          {/* COUNTRY */}
          <div>
            <label htmlFor="sim-country" className={labelClass}>
              Country
            </label>

            <select
              id="sim-country"
              value={countryCode}
              onChange={(event) => {
                setCountryCode(event.target.value);
                setUseCustomFactor(false);
                setCustomFactor("");
                changeInputs();
              }}
              className={inputClass}
            >
              {countryOptions.map((country) => (
                <option
                  key={country.code}
                  value={country.code}
                >
                  {country.name}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Poland has a documented default factor.
              Other countries currently require a
              user-supplied electricity emissions factor.
            </p>
          </div>

          {/* ELECTRICITY CONSUMPTION */}
          <div>
            <label
              htmlFor="sim-electricity"
              className={labelClass}
            >
              Annual electricity consumption (kWh)
            </label>

            <input
              id="sim-electricity"
              type="number"
              min="0"
              max="1000000000"
              step="any"
              required
              value={electricity}
              onChange={(event) => {
                setElectricity(event.target.value);
                changeInputs();
              }}
              className={inputClass}
            />
          </div>

          {/* PRICE */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="sim-price"
                className={labelClass}
              >
                Electricity price per kWh
              </label>

              <input
                id="sim-price"
                type="number"
                min="0"
                step="any"
                required
                value={price}
                onChange={(event) => {
                  setPrice(event.target.value);
                  changeInputs();
                }}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="sim-currency"
                className={labelClass}
              >
                Currency
              </label>

              <select
                id="sim-currency"
                value={currency}
                onChange={(event) => {
                  setCurrency(
                    event.target.value as Currency
                  );
                  changeInputs();
                }}
                className={inputClass}
              >
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* REDUCTION SLIDER */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <label
                htmlFor="sim-reduction"
                className="text-sm font-medium text-slate-300"
              >
                Electricity demand reduction
              </label>

              <span className="text-xl font-semibold text-emerald-400">
                {reduction}%
              </span>
            </div>

            <input
              id="sim-reduction"
              type="range"
              min="0"
              max="100"
              step="5"
              value={reduction}
              onChange={(event) => {
                setReduction(Number(event.target.value));
                changeInputs();
              }}
              className="w-full accent-emerald-400"
            />

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* EMISSIONS FACTOR */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2">
              <Database
                size={18}
                className="text-emerald-400"
              />

              <h3 className="text-sm font-semibold">
                Electricity emissions factor
              </h3>
            </div>

            {countryCode === "POL" && (
              <label className="mt-4 flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={useCustomFactor}
                  onChange={(event) => {
                    setUseCustomFactor(event.target.checked);
                    changeInputs();
                  }}
                  className="accent-emerald-400"
                />
                Override Poland's default factor
              </label>
            )}

            {needsCustomFactor ? (
              <div className="mt-4">
                <label
                  htmlFor="sim-factor"
                  className={labelClass}
                >
                  Custom factor (kg/kWh)
                </label>

                <input
                  id="sim-factor"
                  type="number"
                  min="0"
                  max="5"
                  step="any"
                  required
                  value={customFactor}
                  onChange={(event) => {
                    setCustomFactor(event.target.value);
                    changeInputs();
                  }}
                  placeholder="Enter your documented factor"
                  className={inputClass}
                />

                <p className="mt-2 text-xs leading-5 text-amber-200/80">
                  Custom factors are user-supplied assumptions.
                  Confirm whether your factor measures CO₂ or CO₂e.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-emerald-400/5 p-4">
                <p className="text-lg font-semibold text-emerald-300">
                  0.553 kg CO₂/kWh
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  KOBiZE · Poland · 2024 electricity data
                </p>
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm leading-6 text-rose-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-400 px-5 py-4 font-semibold text-[#071310] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                />
                Calculating...
              </>
            ) : (
              <>
                <Calculator size={20} />
                Run Climate Simulation
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* RESULTS PANEL */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <Leaf
                size={22}
                className="text-emerald-400"
              />

              <h2 className="text-xl font-semibold">
                Simulation Results
              </h2>
            </div>

            {result ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-emerald-300">
                  <CheckCircle2 size={18} />
                  Calculation completed
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/5 p-5">
                    <p className="text-xs text-slate-400">
                      Baseline emissions
                    </p>

                    <p className="mt-3 text-2xl font-semibold">
                      {numberFormat(
                        result.baseline_emissions_tonnes,
                        3
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Tonnes · {result.factor_gas_basis}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-5">
                    <p className="text-xs text-slate-400">
                      Scenario emissions
                    </p>

                    <p className="mt-3 text-2xl font-semibold">
                      {numberFormat(
                        result.scenario_emissions_tonnes,
                        3
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Tonnes · {result.factor_gas_basis}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                    <div className="flex items-center gap-2 text-xs text-emerald-300">
                      <Zap size={15} />
                      Avoided emissions
                    </div>

                    <p className="mt-3 text-2xl font-semibold text-emerald-300">
                      {numberFormat(
                        result.avoided_emissions_tonnes,
                        3
                      )}{" "}
                      t
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                    <div className="flex items-center gap-2 text-xs text-emerald-300">
                      <Wallet size={15} />
                      Annual electricity savings
                    </div>

                    <p className="mt-3 text-2xl font-semibold text-emerald-300">
                      {numberFormat(
                        result.annual_cost_savings
                      )}
                    </p>

                    <p className="mt-1 text-xs text-emerald-300/80">
                      {currencySymbol[result.currency]}
                    </p>
                  </div>
                </div>

                {/* EMISSIONS COMPARISON */}
                <div className="rounded-xl border border-white/10 p-5">
                  <h3 className="mb-5 text-sm font-semibold">
                    Emissions Comparison
                  </h3>

                  <div className="space-y-5">
                    {[
                      {
                        label: "Baseline",
                        value: result.baseline_emissions_tonnes,
                        width: "100%",
                        color: "bg-slate-400",
                      },
                      {
                        label: "Reduction scenario",
                        value: result.scenario_emissions_tonnes,
                        width: `${
                          result.baseline_emissions_tonnes > 0
                            ? Math.min(
                                100,
                                (result.scenario_emissions_tonnes /
                                  result.baseline_emissions_tonnes) *
                                  100
                              )
                            : 0
                        }%`,
                        color: "bg-emerald-400",
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-400">
                          <span>{item.label}</span>
                          <span>
                            {numberFormat(item.value, 3)} t
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: item.width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 p-5">
                  <h3 className="text-sm font-semibold">
                    Financial Summary
                  </h3>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">
                        Baseline electricity cost
                      </span>
                      <span>
                        {numberFormat(
                          result.baseline_electricity_cost
                        )}{" "}
                        {result.currency}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">
                        Scenario electricity cost
                      </span>
                      <span>
                        {numberFormat(
                          result.scenario_electricity_cost
                        )}{" "}
                        {result.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-emerald-400/10 p-5">
                  <Calculator
                    size={38}
                    className="text-emerald-400"
                  />
                </div>

                <h3 className="mt-6 text-lg font-semibold">
                  Ready to calculate
                </h3>

                <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
                  Enter your business electricity data,
                  choose a reduction scenario, and run
                  the simulation to view the results.
                </p>
              </div>
            )}
          </div>

          {/* METHODOLOGY */}
          {result && (
            <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6">
              <div className="mb-4 flex items-center gap-2">
                <Database
                  size={19}
                  className="text-emerald-400"
                />

                <h3 className="font-semibold">
                  Sources & Methodology
                </h3>
              </div>

              <p className="text-sm text-slate-300">
                Factor source: {result.factor_source}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Factor:{" "}
                {result.emission_factor_kg_co2e_per_kwh}{" "}
                {result.factor_unit}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Reporting year:{" "}
                {result.factor_year ?? "Not specified"}
              </p>

              <p className="mt-4 text-xs leading-6 text-slate-400">
                {result.methodology}
              </p>

              {result.factor_source_url && (
                <a
                  href={result.factor_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:underline"
                >
                  View source document
                  <ExternalLink size={14} />
                </a>
              )}

              <h4 className="mt-6 text-sm font-semibold">
                Limitations
              </h4>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-6 text-slate-400">
                {result.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
