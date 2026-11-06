
export type Currency = "PLN" | "EUR" | "USD";

export type SimulationRequest = {
  country_code: string;
  annual_electricity_kwh: number;
  electricity_price_per_kwh: number;
  reduction_percentage: number;
  emission_factor_kg_co2e_per_kwh?: number;
  currency: Currency;
};

export type SimulationResponse = {
  country_code: string;
  annual_electricity_kwh: number;
  reduction_percentage: number;
  currency: Currency;

  emission_factor_kg_co2e_per_kwh: number;
  factor_source: string;
  factor_year: number | null;
  factor_unit: string;
  factor_gas_basis: string;
  factor_source_url: string | null;

  baseline_emissions_tonnes: number;
  scenario_emissions_tonnes: number;
  avoided_emissions_tonnes: number;

  baseline_electricity_cost: number;
  scenario_electricity_cost: number;
  annual_cost_savings: number;

  methodology: string;
  limitations: string[];
};

export type ElectricityEmissionFactor = {
  country_code: string;
  value: number;
  year: number;
  source: string;
  source_url: string;
  unit: string;
  gas_basis: string;
};

export type EmissionFactorsResponse = {
  count: number;
  factors: ElectricityEmissionFactor[];
};
