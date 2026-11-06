
import {
  normalizeCountry,
  type CountryClimate,
  type CountryClimateAPI,
} from "../types/climate";

import type {
  SimulationRequest,
  SimulationResponse,
  EmissionFactorsResponse,
} from "../types/simulator";

// ========================================
// FASTAPI BACKEND URL
// ========================================

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000";

// ========================================
// REUSABLE API REQUEST
// ========================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    let message = `API error: ${response.status}`;

    try {
      const body: unknown = await response.json();

      if (
        typeof body === "object" &&
        body !== null &&
        "detail" in body
      ) {
        const detail = body.detail;

        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail
            .map((item: { msg?: string }) =>
              item.msg ?? "Invalid input"
            )
            .join("; ");
        }
      }
    } catch {
      // Preserve HTTP status if JSON parsing fails.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

// ========================================
// CLIMATE DATA API
// ========================================

export const climateApi = {
  // Retrieve all country climate profiles
  async getCountries(
    signal?: AbortSignal
  ): Promise<CountryClimate[]> {
    const response = await apiRequest<
      CountryClimateAPI[]
    >("/api/climate/countries", { signal });

    return response.map(normalizeCountry);
  },

  // Retrieve a specific country
  async getCountry(
    code: string,
    signal?: AbortSignal
  ): Promise<CountryClimate> {
    const response =
      await apiRequest<CountryClimateAPI>(
        `/api/climate/countries/${encodeURIComponent(code)}`,
        { signal }
      );

    return normalizeCountry(response);
  },

  // Check backend health
  async healthCheck(signal?: AbortSignal) {
    return apiRequest<{
      status: string;
      service: string;
      version: string;
    }>("/api/health", { signal });
  },
};

// ========================================
// SME CLIMATE SIMULATOR API
// ========================================

export const simulatorApi = {
  // Calculate electricity-related emissions
  // and estimated cost savings
  async calculate(
    request: SimulationRequest
  ): Promise<SimulationResponse> {
    return apiRequest<SimulationResponse>(
      "/api/simulator",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  },

  // Retrieve all documented electricity factors
  async getFactors(
    signal?: AbortSignal
  ): Promise<EmissionFactorsResponse> {
    return apiRequest<EmissionFactorsResponse>(
      "/api/simulator/factors",
      { signal }
    );
  },
};
