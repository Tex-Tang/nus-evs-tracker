"use client";
import { MeterCredit } from "@prisma/client";
import { LineChart } from "@tremor/react";
import { format } from "date-fns";
import { cloneDeep, reverse } from "lodash";

export type CreditTrendChartProps = {
  data: MeterCredit[];
};

type CreditTrendSeries = {
  recordedAt: string;
  Credit: number;
};

export function CreditTrendChart({ data }: CreditTrendChartProps) {
  const chartData = reverse(cloneDeep(data)).reduce<CreditTrendSeries[]>((acc, curr) => {
    if (curr.type === "Topup") {
      acc[acc.length - 1].Credit += curr.credit;
    } else {
      acc.push({
        recordedAt: format(curr.recordedAt, "dd MMM"),
        Credit: curr.credit,
      });
    }
    return acc;
  }, []);

  return (
    <LineChart
      className="mt-6"
      data={chartData}
      index="year"
      categories={["Credit"]}
      colors={["blue"]}
      valueFormatter={(value) => `S$${value.toFixed(2)}`}
      yAxisWidth={64}
    />
  );
}
