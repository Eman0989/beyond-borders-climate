
export type ClimateRecord = {
  year: number;
  emissions: number;
};

export type CountryClimate = {
  code: string;
  name: string;
  emissions: number;
  emissionsPerCapita: number;
  renewableShare: number;
  temperatureChange: number;
  history: ClimateRecord[];
  dataStatus: string;
  emissionsUnit: string;
  dataSource: string;
};

// Data structure returned by Python FastAPI
export type CountryClimateAPI = {
  code: string;
  name: string;
  emissions: number;
  emissions_per_capita: number;
  renewable_share: number;
  temperature_change: number;
  history: ClimateRecord[];
  data_status: string;
  emissions_unit: string;
  data_source: string;
};

// Converts Python snake_case to TypeScript camelCase
export function normalizeCountry(
  country: CountryClimateAPI
): CountryClimate {
  return {
    code: country.code,
    name: country.name,
    emissions: country.emissions,
    emissionsPerCapita: country.emissions_per_capita,
    renewableShare: country.renewable_share,
    temperatureChange: country.temperature_change,
    history: country.history,
    dataStatus: country.data_status,
    emissionsUnit: country.emissions_unit,
    dataSource: country.data_source,
  };
}
