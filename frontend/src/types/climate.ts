
export type ClimateRecord = {
  year: number;
  emissions: number;
  emissionsPerCapita: number | null;
};

export type CountryClimate = {
  code: string;
  name: string;
  year: number;
  emissions: number;
  emissionsPerCapita: number | null;
  renewableShare: number | null;
  temperatureChange: number | null;
  history: ClimateRecord[];
  dataStatus: string;
  emissionsUnit: string;
  perCapitaUnit: string;
  dataSource: string;
  sourceUrl: string;
};

type ClimateRecordAPI = {
  year: number;
  emissions: number;
  emissions_per_capita: number | null;
};

export type CountryClimateAPI = {
  code: string;
  name: string;
  year: number;
  emissions: number;
  emissions_per_capita: number | null;
  renewable_share: number | null;
  temperature_change: number | null;
  history: ClimateRecordAPI[];
  data_status: string;
  emissions_unit: string;
  per_capita_unit: string;
  data_source: string;
  source_url: string;
};

export function normalizeCountry(
  country: CountryClimateAPI
): CountryClimate {
  return {
    code: country.code,
    name: country.name,
    year: country.year,
    emissions: country.emissions,
    emissionsPerCapita: country.emissions_per_capita,
    renewableShare: country.renewable_share,
    temperatureChange: country.temperature_change,
    history: country.history.map((record) => ({
      year: record.year,
      emissions: record.emissions,
      emissionsPerCapita: record.emissions_per_capita,
    })),
    dataStatus: country.data_status,
    emissionsUnit: country.emissions_unit,
    perCapitaUnit: country.per_capita_unit,
    dataSource: country.data_source,
    sourceUrl: country.source_url,
  };
}
