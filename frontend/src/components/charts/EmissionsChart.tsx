
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { ClimateRecord } from "../../data/climateData";

type Props = {
  data: ClimateRecord[];
  country: string;
};

export default function EmissionsChart({ data, country }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">
          Historical CO₂ Emissions
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          {country} — demonstration dataset
        </p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="emissionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#34d399"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="#34d399"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#ffffff15"
              vertical={false}
            />

            <XAxis
              dataKey="year"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              width={45}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#10241d",
                border: "1px solid #ffffff20",
                borderRadius: "12px",
                color: "#ffffff",
              }}
              formatter={(value) => [
                `${Number(value).toFixed(1)} Mt CO₂`,
                "Emissions",
              ]}
            />

            <Area
              type="monotone"
              dataKey="emissions"
              stroke="#34d399"
              strokeWidth={3}
              fill="url(#emissionsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
