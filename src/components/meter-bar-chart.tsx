"use client";
import { BarChart } from "@tremor/react";

export type MeterBarChartProps = {
  data: {
    id: string;
    type: string;
    recordedAt: string;
    credit: number;
  }[];
};

type GraphData = {
  recordedAt: string;
  Credit: number;
  Topup: number;
};

export function MeterBarChart({ data }: MeterBarChartProps) {
  const graphData = data.reduce<GraphData[]>((acc, curr) => {
    if (curr.type === "Topup") {
      acc[acc.length - 1].Topup += curr.credit;
    } else {
      acc.push({
        recordedAt: curr.recordedAt,
        Credit: curr.credit,
        Topup: 0,
      });
    }
    return acc;
  }, []);

  return (
    <BarChart
      className="my-6"
      data={graphData}
      index="recordedAt"
      categories={["Credit", "Topup"]}
      colors={["blue", "green"]}
      stack
      animationDuration={0}
      valueFormatter={(value) => `S$${value.toFixed(2)}`}
      yAxisWidth={64}
    />
  );
}
