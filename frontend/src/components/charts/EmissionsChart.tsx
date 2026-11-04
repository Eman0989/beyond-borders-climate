
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { ClimateRecord } from "../../types/climate";

type Props = {
  data: ClimateRecord[];
  country: string;
};

export default function EmissionsChart({
  data,
  country,
}: Props) {
  const sortedData = [...data].sort(
    (a, b) => a.year - b.year
  );

  const firstYear = sortedData[0]?.year;
  const lastYear = sortedData[sortedData.length - 1]?.year;

  const formatEmissions = (value: number) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0d1e19] p-5 sm:p-6">
      {/* CHART HEADER */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Historical CO₂ Emissions
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {country} — territorial CO₂ emissions
          </p>
        </div>

        {firstYear !== undefined && lastYear !== undefined && (
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
            {firstYear}–{lastYear}
          </span>
        )}
      </div>

      {/* CHART */}
      {sortedData.length > 0 ? (
        <div className="h-[280px] w-full sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sortedData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient
                  id="emissionsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#34d399"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#34d399"
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#ffffff15"
                vertical={false}
              />

              <XAxis
                dataKey="year"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value) => String(value)}
                allowDecimals={false}
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                minTickGap={25}
                fontSize={12}
              />

              <YAxis
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                width={55}
                fontSize={12}
                tickFormatter={(value) =>
                  `${Number(value).toFixed(0)}`
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#10241d",
                  border: "1px solid #ffffff20",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
                labelFormatter={(year) =>
                  `Year: ${year}`
                }
                formatter={(value) => [
                  `${formatEmissions(Number(value))} Mt CO₂`,
                  "Annual emissions",
                ]}
              />

              <Area
                type="monotone"
                dataKey="emissions"
                stroke="#34d399"
                strokeWidth={3}
                fill="url(#emissionsGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#34d399",
                  stroke: "#071310",
                  strokeWidth: 2,
                }}
                connectNulls={false}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
          Historical emissions data is unavailable.
        </div>
      )}

      {/* CHART FOOTER */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

          <span className="text-xs text-slate-400">
            Annual territorial CO₂ emissions
          </span>
        </div>

        <span className="text-xs text-slate-500">
          Unit: million tonnes (Mt CO₂)
        </span>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Source: Our World in Data. Fossil-fuel and
        industrial CO₂ emissions, excluding land-use change.
        The chart displays available observations only.
      </p>
    </div>
  );
}
