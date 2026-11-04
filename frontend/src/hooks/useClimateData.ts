
import { useEffect, useState } from "react";
import { climateApi } from "../services/api";
import type { CountryClimate } from "../types/climate";

type ClimateDataState = {
  countries: CountryClimate[];
  loading: boolean;
  error: string | null;
};

export function useClimateData(): ClimateDataState {
  const [countries, setCountries] = useState<CountryClimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadClimateData() {
      try {
        const data = await climateApi.getCountries(controller.signal);

        if (!controller.signal.aborted) {
          setCountries(data);
          setError(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load climate data."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadClimateData();

    return () => controller.abort();
  }, []);

  return { countries, loading, error };
}
