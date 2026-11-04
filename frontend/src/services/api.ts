
import {
  normalizeCountry,
  type CountryClimate,
  type CountryClimateAPI,
} from "../types/climate";

// FastAPI backend address
const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// Reusable API request function
async function apiRequest<T>(
  endpoint: string,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

// Climate API endpoints
export const climateApi = {
  // Get all available countries
  async getCountries(
    signal?: AbortSignal
  ): Promise<CountryClimate[]> {
    const response = await apiRequest<CountryClimateAPI[]>(
      "/api/climate/countries",
      signal
    );

    return response.map(normalizeCountry);
  },

  // Get climate information for a specific country
  async getCountry(
    code: string,
    signal?: AbortSignal
  ): Promise<CountryClimate> {
    const response = await apiRequest<CountryClimateAPI>(
      `/api/climate/countries/${encodeURIComponent(code)}`,
      signal
    );

    return normalizeCountry(response);
  },

  // Check whether FastAPI is running
  async healthCheck(signal?: AbortSignal) {
    return apiRequest<{
      status: string;
      service: string;
      version: string;
    }>("/api/health", signal);
  },
};
