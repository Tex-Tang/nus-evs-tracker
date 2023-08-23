"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MeterCredit } from "@prisma/client";
import { LineChart } from "@tremor/react";
import { format } from "date-fns";
import { cloneDeep, reverse } from "lodash";

export type CreditTrendChartProps = {
  data: MeterCredit[];
};

type CreditTrendSeries = {
  Date: string;
  Credit: number;
};

export function CreditTrendChart({ data }: CreditTrendChartProps) {
  const chartData = reverse(cloneDeep(data)).reduce<CreditTrendSeries[]>((acc, curr) => {
    if (curr.type === "Topup") {
      acc[acc.length - 1].Credit += curr.credit;
    } else {
      acc.push({
        Date: format(curr.recordedAt, "dd MMM"),
        Credit: curr.credit,
      });
    }
    return acc;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Trend</CardTitle>
        <CardDescription>We track your credit history and show you how your credit changes over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart
          data={chartData}
          index="Date"
          categories={["Credit"]}
          colors={["blue"]}
          className="h-64"
          valueFormatter={(value) => `S$${value.toFixed(2)}`}
          yAxisWidth={64}
        />
      </CardContent>
    </Card>
  );
}
