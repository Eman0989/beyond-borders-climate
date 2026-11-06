
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  Database,
  ExternalLink,
  Factory,
  Leaf,
  LoaderCircle,
  RefreshCw,
  Wallet,
  Zap,
} from "lucide-react";

import { simulatorApi } from "../services/api";
import { useClimateData } from "../hooks/useClimateData";

import type {
  Currency,
  ElectricityEmissionFactor,
  SimulationResponse,
  ScenarioComparisonResponse,
  ScenarioComparisonRequest,
} from "../types/simulator";

// ========================================
// FALLBACK COUNTRY OPTIONS
// ========================================

const FALLBACK_COUNTRIES = [
  { code: "POL", name: "Poland" },
  { code: "DEU", name: "Germany" },
  { code: "PAK", name: "Pakistan" },
];

// ========================================
// FORMATTING
// ========================================

function numberFormat(
  value: number,
  digits = 2
): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#10241d] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-300";

const panelClass =
  "rounded-2xl border border-white/10 bg-[#0d1e19] p-6 sm:p-7";

// ========================================
// MAIN SIMULATOR COMPONENT
// ========================================

export default function Simulator() {
  const { countries } = useClimateData();

  // ========================================
  // BUSINESS INPUTS
  // ========================================

  const [countryCode, setCountryCode] =
    useState("POL");

  const [electricity, setElectricity] =
    useState("10000");

  const [price, setPrice] =
    useState("0.90");

  const [reduction, setReduction] =
    useState(20);

  const [currency, setCurrency] =
    useState<Currency>("PLN");

  const [useCustomFactor, setUseCustomFactor] =
    useState(false);

  const [customFactor, setCustomFactor] =
    useState("");

  // ========================================
  // DOCUMENTED FACTOR STATE
  // ========================================

  const [availableFactors, setAvailableFactors] =
    useState<ElectricityEmissionFactor[]>([]);

  const [factorsLoading, setFactorsLoading] =
    useState(true);

  const [factorsError, setFactorsError] =
    useState<string | null>(null);

  // ========================================
  // SINGLE SIMULATION STATE
  // ========================================

  const [result, setResult] =
    useState<SimulationResponse | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ========================================
  // SCENARIO COMPARISON STATE
  // ========================================

  const [comparison, setComparison] =
    useState<ScenarioComparisonResponse | null>(
      null
    );

  const [comparing, setComparing] =
    useState(false);

  const [comparisonError, setComparisonError] =
    useState<string | null>(null);

  // Prevent responses from old inputs replacing
  // results calculated with newer inputs.
  const requestVersion = useRef(0);

  // ========================================
  // FETCH COUNTRY FACTORS
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    async function loadFactors() {
      try {
        const response =
          await simulatorApi.getFactors(
            controller.signal
          );

        if (!controller.signal.aborted) {
          setAvailableFactors(response.factors);
          setFactorsError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setFactorsError(
            err instanceof Error
              ? err.message
              : "Unable to load electricity factors."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setFactorsLoading(false);
        }
      }
    }

    void loadFactors();

    return () => controller.abort();
  }, []);

  // ========================================
  // COUNTRY FACTOR SELECTION
  // ========================================

  const selectedFactor =
    availableFactors.find(
      (factor) =>
        factor.country_code === countryCode
    );

  const needsCustomFactor =
    !selectedFactor || useCustomFactor;

  const countryOptions =
    countries.length > 0
      ? countries
      : FALLBACK_COUNTRIES;

  const busy = submitting || comparing;

  const actionDisabled =
    busy ||
    factorsLoading ||
    factorsError !== null;

  // ========================================
  // RESET OUTDATED RESULTS
  // ========================================

  function changeInputs() {
    requestVersion.current += 1;

    setResult(null);
    setError(null);

    setComparison(null);
    setComparisonError(null);
  }

  // ========================================
  // SHARED INPUT VALIDATION
  // ========================================

  function getValidInputs():
    | ScenarioComparisonRequest
    | null {

    const annualKwh = Number(electricity);
    const electricityPrice = Number(price);

    if (
      electricity.trim() === "" ||
      !Number.isFinite(annualKwh) ||
      annualKwh < 0 ||
      annualKwh > 1_000_000_000
    ) {
      throw new Error(
        "Enter a valid annual electricity consumption between 0 and 1 billion kWh."
      );
    }

    if (
      price.trim() === "" ||
      !Number.isFinite(electricityPrice) ||
      electricityPrice < 0
    ) {
      throw new Error(
        "Enter a valid electricity price per kWh."
      );
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
        throw new Error(
          "Enter an electricity emissions factor between 0 and 5 kg/kWh."
        );
      }
    }

    return {
      country_code: countryCode,
      annual_electricity_kwh: annualKwh,
      electricity_price_per_kwh:
        electricityPrice,
      currency,
      ...(factor !== undefined
        ? {
            emission_factor_kg_co2e_per_kwh:
              factor,
          }
        : {}),
    };
  }

  // ========================================
  // ORIGINAL SINGLE SIMULATION
  // ========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (actionDisabled) return;

    let inputs: ScenarioComparisonRequest;

    try {
      const validated = getValidInputs();

      if (!validated) return;

      inputs = validated;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid business inputs."
      );
      return;
    }

    const currentVersion = requestVersion.current;

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response =
        await simulatorApi.calculate({
          ...inputs,
          reduction_percentage: reduction,
        });

      if (
        requestVersion.current === currentVersion
      ) {
        setResult(response);
      }
    } catch (err) {
      if (
        requestVersion.current === currentVersion
      ) {
        setError(
          err instanceof Error
            ? err.message
            : "Simulation failed."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ========================================
  // ADVANCED SCENARIO COMPARISON
  // ========================================

  async function handleCompareScenarios() {
    if (actionDisabled) return;

    let inputs: ScenarioComparisonRequest;

    try {
      const validated = getValidInputs();

      if (!validated) return;

      inputs = validated;
    } catch (err) {
      setComparisonError(
        err instanceof Error
          ? err.message
          : "Invalid business inputs."
      );
      return;
    }

    const currentVersion = requestVersion.current;

    setComparing(true);
    setComparisonError(null);
    setComparison(null);

    try {
      const response =
        await simulatorApi.compareScenarios(
          inputs
        );

      if (
        requestVersion.current === currentVersion
      ) {
        setComparison(response);
      }
    } catch (err) {
      if (
        requestVersion.current === currentVersion
      ) {
        setComparisonError(
          err instanceof Error
            ? err.message
            : "Scenario comparison failed."
        );
      }
    } finally {
      setComparing(false);
    }
  }

  // ========================================
  // INTERFACE
  // ========================================

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
          explore reduction strategies, and compare
          potential electricity cost savings.
        </p>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* =====================================
            BUSINESS INPUTS
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className={`${panelClass} space-y-6`}
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
            <label
              htmlFor="sim-country"
              className={labelClass}
            >
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
              Documented national electricity factors
              are selected automatically where
              available.
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

          {/* ELECTRICITY PRICE */}
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
                Individual reduction scenario
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
                setReduction(
                  Number(event.target.value)
                );
                changeInputs();
              }}
              className="w-full accent-emerald-400"
            />

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              This slider controls the individual
              simulation. The comparison always uses
              10%, 20%, and 40%.
            </p>
          </div>

          {/* EMISSIONS FACTOR */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2">
              <Database
                size={18}
                className="text-emerald-400"
              />

              <h3 className="text-sm font-semibold">
                Electricity Emissions Factor
              </h3>
            </div>

            {factorsLoading ? (
              <div
                role="status"
                className="mt-4 flex items-center gap-3 text-sm text-slate-400"
              >
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />
                Loading country factors...
              </div>
            ) : factorsError ? (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-300"
              >
                Could not load electricity factors.
                {` ${factorsError}`}
              </div>
            ) : (
              <>
                {selectedFactor && (
                  <label className="mt-4 flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={useCustomFactor}
                      onChange={(event) => {
                        setUseCustomFactor(
                          event.target.checked
                        );
                        changeInputs();
                      }}
                      className="accent-emerald-400"
                    />
                    Override documented country factor
                  </label>
                )}

                {needsCustomFactor ? (
                  <div className="mt-4">
                    {!selectedFactor && (
                      <p className="mb-3 text-xs leading-5 text-amber-200">
                        No documented default factor
                        is available for this country.
                        Enter a custom factor.
                      </p>
                    )}

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
                        setCustomFactor(
                          event.target.value
                        );
                        changeInputs();
                      }}
                      placeholder="Enter your electricity factor"
                      className={inputClass}
                    />

                    <p className="mt-2 text-xs leading-5 text-amber-200/80">
                      Custom factors are user-supplied
                      assumptions. Confirm whether
                      your source measures CO₂ or CO₂e.
                    </p>
                  </div>
                ) : (
                  selectedFactor && (
                    <div className="mt-4 rounded-lg bg-emerald-400/5 p-4">
                      <p className="text-lg font-semibold text-emerald-300">
                        {selectedFactor.value}{" "}
                        {selectedFactor.unit}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {selectedFactor.source} ·{" "}
                        {selectedFactor.year}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedFactor.gas_basis}
                      </p>

                      {selectedFactor.source_url && (
                        <a
                          href={selectedFactor.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                        >
                          View factor source
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  )
                )}
              </>
            )}
          </div>

          {/* SINGLE SIMULATION ERROR */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-300"
            >
              {error}
            </div>
          )}

          {/* SINGLE SIMULATION BUTTON */}
          <button
            type="submit"
            disabled={actionDisabled}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-400 px-5 py-4 font-semibold text-[#071310] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* ADVANCED COMPARISON BUTTON */}
          <div className="border-t border-white/10 pt-5">
            <p className="mb-4 text-sm leading-6 text-slate-400">
              Want to compare multiple strategies?
              Calculate conservative, moderate,
              and ambitious electricity reductions
              using the same business inputs.
            </p>

            <button
              type="button"
              onClick={handleCompareScenarios}
              disabled={actionDisabled}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-4 font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {comparing ? (
                <>
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
                  />
                  Comparing strategies...
                </>
              ) : (
                <>
                  <BarChart3 size={20} />
                  Compare Three Strategies
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {comparisonError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-300"
              >
                {comparisonError}
              </div>
            )}
          </div>
        </form>

        {/* =====================================
            SINGLE SIMULATION RESULTS
        ===================================== */}

        <div className="space-y-5">
          <div className={panelClass}>
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

                {/* EMISSIONS AND SAVINGS */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/5 p-5">
                    <p className="text-xs text-slate-400">
                      Baseline emissions
                    </p>

                    <p className="mt-3 text-2xl font-semibold">
                      {numberFormat(
                        result.baseline_emissions_tonnes,
                        3
                      )}{" "}
                      t
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {result.factor_gas_basis}
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
                      )}{" "}
                      t
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {result.factor_gas_basis}
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
                      {result.currency}
                    </p>
                  </div>
                </div>

                {/* EMISSIONS BAR COMPARISON */}
                <div className="rounded-xl border border-white/10 p-5">
                  <h3 className="mb-5 text-sm font-semibold">
                    Emissions Comparison
                  </h3>

                  <div className="space-y-5">
                    {[
                      {
                        label: "Baseline",
                        value:
                          result.baseline_emissions_tonnes,
                        width: "100%",
                        color: "bg-slate-400",
                      },
                      {
                        label: "Reduction scenario",
                        value:
                          result.scenario_emissions_tonnes,
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
                            {numberFormat(
                              item.value,
                              3
                            )}{" "}
                            t
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{
                              width: item.width,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FINANCIAL SUMMARY */}
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

                    <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                      <span className="text-emerald-300">
                        Estimated annual savings
                      </span>

                      <span className="font-semibold text-emerald-300">
                        {numberFormat(
                          result.annual_cost_savings
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
                  Enter your business electricity
                  data and run a simulation to view
                  emissions and cost savings.
                </p>
              </div>
            )}
          </div>

          {/* SOURCES AND METHODOLOGY */}
          {result && (
            <div className={panelClass}>
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
                {
                  result.emission_factor_kg_co2e_per_kwh
                }{" "}
                {result.factor_unit}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Reporting year:{" "}
                {result.factor_year ??
                  "Not specified"}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Gas basis: {result.factor_gas_basis}
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
                {result.limitations.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* =====================================
          ADVANCED SCENARIO COMPARISON
      ===================================== */}

      {comparison && (
        <section
          aria-labelledby="comparison-heading"
          className={`${panelClass} space-y-6`}
        >
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
              <BarChart3 size={20} />
              Business Strategy Comparison
            </div>

            <h2
              id="comparison-heading"
              className="text-2xl font-semibold"
            >
              Compare Three Strategies
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Evaluate conservative, moderate, and
              ambitious electricity-demand reductions.
              All calculations are supplied by
              your FastAPI scenario-comparison engine.
            </p>
          </div>

          {/* THREE SCENARIO CARDS */}
          <div className="grid gap-5 md:grid-cols-3">
            {comparison.scenarios.map(
              (scenario) => {
                const calculation =
                  scenario.calculation;

                const isAmbitious =
                  scenario.name === "Ambitious";

                return (
                  <div
                    key={scenario.name}
                    className={`rounded-2xl border p-5 sm:p-6 ${
                      isAmbitious
                        ? "border-emerald-400/40 bg-emerald-400/5"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      {scenario.name}
                    </p>

                    <p className="mt-3 text-4xl font-semibold text-emerald-300">
                      {scenario.reduction_percentage}%
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Electricity demand reduction
                    </p>

                    <div className="my-6 h-px bg-white/10" />

                    <div className="space-y-5">
                      <div>
                        <p className="text-xs text-slate-400">
                          Annual cost savings
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-emerald-300">
                          {numberFormat(
                            calculation.annual_cost_savings
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {comparison.currency}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Avoided emissions
                        </p>

                        <p className="mt-2 text-xl font-semibold">
                          {numberFormat(
                            calculation.avoided_emissions_tonnes,
                            3
                          )}{" "}
                          t
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Electricity remaining
                        </p>

                        <p className="mt-2 text-lg font-medium">
                          {numberFormat(
                            scenario.remaining_electricity_kwh,
                            0
                          )}{" "}
                          kWh
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Scenario emissions
                        </p>

                        <p className="mt-2 text-lg font-medium">
                          {numberFormat(
                            calculation.scenario_emissions_tonnes,
                            3
                          )}{" "}
                          t
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Electricity cost after reduction
                        </p>

                        <p className="mt-2 text-lg font-medium">
                          {numberFormat(
                            calculation.scenario_electricity_cost
                          )}{" "}
                          {comparison.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* COMPARATIVE SAVINGS BARS */}
          <div className="rounded-xl border border-white/10 p-5">
            <h3 className="mb-5 text-sm font-semibold">
              Annual Savings Comparison
            </h3>

            <div className="space-y-5">
              {comparison.scenarios.map(
                (scenario) => {
                  const maxSavings = Math.max(
                    0,
                    ...comparison.scenarios.map(
                      (item) =>
                        item.calculation
                          .annual_cost_savings
                    )
                  );

                  const savings =
                    scenario.calculation
                      .annual_cost_savings;

                  const width =
                    maxSavings > 0
                      ? (savings / maxSavings) * 100
                      : 0;

                  return (
                    <div key={scenario.name}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-400">
                          {scenario.name}
                        </span>

                        <span className="text-slate-200">
                          {numberFormat(savings)}{" "}
                          {comparison.currency}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* SCENARIO METHODOLOGY */}
          <div className="rounded-xl border border-white/10 p-5">
            <h3 className="mb-3 text-sm font-semibold">
              Comparison Methodology
            </h3>

            <p className="text-xs leading-6 text-slate-400">
              {comparison.methodology}
            </p>

            {comparison.scenarios[0] && (
              <>
                <p className="mt-3 text-xs text-slate-400">
                  Factor source:{" "}
                  {
                    comparison.scenarios[0]
                      .calculation.factor_source
                  }
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Gas basis:{" "}
                  {
                    comparison.scenarios[0]
                      .calculation.factor_gas_basis
                  }
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Reporting year:{" "}
                  {comparison.scenarios[0]
                    .calculation.factor_year ??
                    "Not specified"}
                </p>

                <p className="mt-3 text-xs leading-6 text-slate-500">
                  These comparisons are illustrative.
                  They assume a constant electricity
                  price and emissions factor, exclude
                  implementation costs, and do not
                  represent certified emissions
                  inventories.
                </p>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
