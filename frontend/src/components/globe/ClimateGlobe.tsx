
import { useEffect, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";

type CountryFeature = {
  type: "Feature";
  properties: {
    ADMIN: string;
    ISO_A3: string;
    ISO_A2?: string;
  };
  geometry: {
    type: string;
    coordinates: unknown;
  };
};

type ClimateGlobeProps = {
  selectedCountry: string | null;
  onCountrySelect: (code: string, name: string) => void;
};

const countryLocations: Record<
  string,
  { lat: number; lng: number }
> = {
  POL: { lat: 52.0, lng: 19.1 },
  DEU: { lat: 51.1, lng: 10.4 },
  PAK: { lat: 30.4, lng: 69.3 },
};

export default function ClimateGlobe({
  selectedCountry,
  onCountrySelect,
}: ClimateGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [width, setWidth] = useState(800);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Responsive globe height
  const globeHeight =
    width < 640 ? 420 : width < 1024 ? 520 : 650;

  // Load geographic country boundaries
  useEffect(() => {
    const controller = new AbortController();

    async function loadCountries() {
      try {
        const response = await fetch("/data/countries.geojson", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            "Country boundary data could not be loaded."
          );
        }

        const geojson = await response.json();

        if (!Array.isArray(geojson.features)) {
          throw new Error("Invalid geographic data.");
        }

        setCountries(
          (geojson.features as CountryFeature[]).filter(
            (feature) =>
              feature.properties.ISO_A2 !== "AQ"
          )
        );

        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unknown loading error."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCountries();

    return () => controller.abort();
  }, []);

  // Automatically resize globe when container changes
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width;

      if (nextWidth && nextWidth > 0) {
        setWidth(nextWidth);
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Configure globe rotation and camera
  useEffect(() => {
    const globe = globeRef.current;

    if (!globe) return;

    globe.pointOfView(
      {
        lat: 35,
        lng: 20,
        altitude: 2.4,
      },
      1000
    );

    const controls = globe.controls();

    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = false;
  }, []);

  // Fly to selected countries
  useEffect(() => {
    if (!selectedCountry) return;

    const position = countryLocations[selectedCountry];

    if (!position || !globeRef.current) return;

    globeRef.current.pointOfView(
      {
        ...position,
        altitude: 1.6,
      },
      1200
    );
  }, [selectedCountry]);

  // Country selection
  function handleCountryClick(feature: CountryFeature) {
    const code = feature.properties.ISO_A3;
    const name = feature.properties.ADMIN;

    onCountrySelect(code, name);
  }

  // Zoom in
  function zoomIn() {
    const globe = globeRef.current;

    if (!globe) return;

    const pov = globe.pointOfView();

    globe.pointOfView(
      {
        ...pov,
        altitude: Math.max(0.5, pov.altitude - 0.4),
      },
      400
    );
  }

  // Zoom out
  function zoomOut() {
    const globe = globeRef.current;

    if (!globe) return;

    const pov = globe.pointOfView();

    globe.pointOfView(
      {
        ...pov,
        altitude: Math.min(4, pov.altitude + 0.4),
      },
      400
    );
  }

  return (
    <div
      ref={containerRef}
      className="
        relative
        h-[420px]
        w-full
        overflow-hidden
        rounded-2xl
        bg-[#06110e]
        sm:h-[520px]
        lg:h-[650px]
      "
    >
      {/* LOADING STATE */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#06110e] text-emerald-300">
          <div className="text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />

            <p className="text-sm">
              Loading Earth...
            </p>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div
          role="alert"
          className="absolute inset-0 z-20 flex items-center justify-center bg-[#06110e] p-6 text-center text-rose-300"
        >
          {error}
        </div>
      )}

      {/* INTERACTIVE GLOBE */}
      <Globe
        ref={globeRef}
        width={width}
        height={globeHeight}
        backgroundColor="#06110e"
        globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
        showAtmosphere={true}
        atmosphereColor="#34d399"
        atmosphereAltitude={0.15}
        polygonsData={countries}
        polygonCapColor={(item) => {
          const feature = item as CountryFeature;
          const code = feature.properties.ISO_A3;

          if (code === selectedCountry) {
            return "rgba(52,211,153,0.65)";
          }

          if (code === hoveredCountry) {
            return "rgba(110,231,183,0.42)";
          }

          return "rgba(52,211,153,0.08)";
        }}
        polygonSideColor={() =>
          "rgba(16,185,129,0.1)"
        }
        polygonStrokeColor={() =>
          "rgba(110,231,183,0.55)"
        }
        polygonAltitude={(item) => {
          const code = (item as CountryFeature)
            .properties.ISO_A3;

          return code === selectedCountry
            ? 0.035
            : 0.008;
        }}
        polygonLabel={(item) => {
          const feature = item as CountryFeature;

          return feature.properties.ADMIN;
        }}
        onPolygonHover={(item) => {
          setHoveredCountry(
            item
              ? (item as CountryFeature)
                  .properties.ISO_A3
              : null
          );
        }}
        onPolygonClick={(item) =>
          handleCountryClick(item as CountryFeature)
        }
        polygonsTransitionDuration={250}
      />

      {/* ZOOM CONTROLS */}
      <div className="absolute bottom-5 right-5 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Zoom in"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-[#10241d] text-xl text-white transition hover:bg-emerald-900"
        >
          +
        </button>

        <button
          type="button"
          onClick={zoomOut}
          aria-label="Zoom out"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-[#10241d] text-xl text-white transition hover:bg-emerald-900"
        >
          −
        </button>
      </div>

      {/* USER INSTRUCTIONS */}
      <div className="pointer-events-none absolute bottom-5 left-4 max-w-[65%] text-xs leading-5 text-slate-400 sm:left-5">
        Drag to rotate · Scroll to zoom · Click a country
      </div>
    </div>
  );
}
