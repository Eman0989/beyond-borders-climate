
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { CountryClimate } from "../../types/climate";

type Props = {
  countries: CountryClimate[];
};

export default function CountryComparisonChart({
  countries,
}: Props) {
  const data = countries.map((country) => ({
    name: country.name,
    emissions: country.emissions,
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6">
      <h3 className="text-lg font-semibold">
        Country Comparison
      </h3>

      <p className="mt-2 text-sm text-slate-400">
        Annual CO₂ emissions — synthetic demonstration data
      </p>

      <div className="mt-6 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 5, right: 15 }}
          >
            <CartesianGrid
              stroke="#ffffff15"
              horizontal={false}
            />

            <XAxis
              type="number"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              unit=" Mt"
            />

            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              width={75}
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

            <Bar
              dataKey="emissions"
              fill="#34d399"
              radius={[0, 6, 6, 0]}
              barSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
