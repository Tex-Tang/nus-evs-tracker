"use client";

import { BarChart } from "@tremor/react";

export type CostSeries = {
  Date: string;
  "Average Daily Cost": number;
};

export function CostChart({ data }: { data: CostSeries[] }) {
  return (
    <BarChart
      className="mt-6"
      data={data}
      index="Date"
      categories={["Average Daily Cost"]}
      colors={["blue"]}
      yAxisWidth={48}
      valueFormatter={(value) => `S$${value.toFixed(2)}`}
    />
  );
}
