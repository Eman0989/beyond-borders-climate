
export type CountryCode = "POL" | "DEU" | "PAK";

export type ClimateRecord = {
  year: number;
  emissions: number;
};

export type CountryClimate = {
  code: CountryCode;
  name: string;
  emissions: number;
  emissionsPerCapita: number;
  renewableShare: number;
  temperatureChange: number;
  history: ClimateRecord[];
};

export const countries: CountryClimate[] = [
  {
    code: "POL",
    name: "Poland",
    emissions: 310,
    emissionsPerCapita: 8.2,
    renewableShare: 23,
    temperatureChange: 1.6,
    history: [
      { year: 2019, emissions: 330 },
      { year: 2020, emissions: 305 },
      { year: 2021, emissions: 325 },
      { year: 2022, emissions: 320 },
      { year: 2023, emissions: 305 },
      { year: 2024, emissions: 310 },
    ],
  },
  {
    code: "DEU",
    name: "Germany",
    emissions: 590,
    emissionsPerCapita: 7.1,
    renewableShare: 54,
    temperatureChange: 1.8,
    history: [
      { year: 2019, emissions: 680 },
      { year: 2020, emissions: 620 },
      { year: 2021, emissions: 650 },
      { year: 2022, emissions: 640 },
      { year: 2023, emissions: 610 },
      { year: 2024, emissions: 590 },
    ],
  },
  {
    code: "PAK",
    name: "Pakistan",
    emissions: 200,
    emissionsPerCapita: 0.9,
    renewableShare: 12,
    temperatureChange: 1.3,
    history: [
      { year: 2019, emissions: 175 },
      { year: 2020, emissions: 170 },
      { year: 2021, emissions: 185 },
      { year: 2022, emissions: 195 },
      { year: 2023, emissions: 198 },
      { year: 2024, emissions: 200 },
    ],
  },
];
