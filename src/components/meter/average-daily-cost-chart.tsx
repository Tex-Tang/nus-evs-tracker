"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MeterCredit } from "@prisma/client";
import { BarChart } from "@tremor/react";
import { addDays, differenceInHours, startOfDay, subDays } from "date-fns";
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { cloneDeep, reverse } from "lodash";

type AverageDailyCostChartProps = {
  data: MeterCredit[];
};

function listAverageDailyCost(meterCredits: MeterCredit[]) {
  const data = reverse(cloneDeep(meterCredits));

  const startDate = addDays(startOfDay(utcToZonedTime(data[0].recordedAt, "Asia/Singapore")), 1);
  const endDate = subDays(startOfDay(utcToZonedTime(data[data.length - 1].recordedAt, "Asia/Singapore")), 1);

  let i = 0;

  const averageDailyCost = [];
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const startDate = date;
    const endDate = addDays(date, 1);

    while (i < data.length && data[i].recordedAt <= date) i++;
    const startIndex = i;
    while (i < data.length && data[i].recordedAt <= addDays(date, 1)) i++;
    const endIndex = i - 1;

    // Cost Formula: Credit Before - Credit After + Topup

    let cost = 0;
    if (startIndex > 0) {
      const diffInHoursComparedToDateBefore = differenceInHours(
        data[startIndex - 1].recordedAt,
        data[startIndex].recordedAt
      );
      const diffInHoursComparedToStartDate = differenceInHours(startDate, data[startIndex].recordedAt);
      const totalCredit = data[startIndex - 1].credit - data[startIndex].credit;
      const averageBefore = (totalCredit / diffInHoursComparedToDateBefore) * diffInHoursComparedToStartDate;
      cost += averageBefore;
    }

    const totalTopup = data
      .slice(startIndex, endIndex + 1)
      .reduce((acc, curr) => (curr.type == "Topup" ? acc + curr.credit : acc), 0);
    const creditChange = data[startIndex].credit - data[endIndex].credit + totalTopup;
    cost += creditChange;

    if (endIndex < data.length - 1) {
      const diffInHoursComparedToDateAfter = differenceInHours(
        data[endIndex].recordedAt,
        data[endIndex + 1].recordedAt
      );
      const diffInHoursComparedToEndDate = differenceInHours(data[endIndex].recordedAt, endDate);
      const totalCredit = data[endIndex].credit - data[endIndex + 1].credit;
      const averageAfter = (totalCredit / diffInHoursComparedToDateAfter) * diffInHoursComparedToEndDate;
      cost += averageAfter;
    }

    averageDailyCost.push({ date, cost });
  }

  return averageDailyCost;
}

export function AverageDailyCostChart({ data }: AverageDailyCostChartProps) {
  const averageDailyCost = listAverageDailyCost(data).map((d) => ({
    Date: formatInTimeZone(d.date, "Asia/Singapore", "dd MMM"),
    "Average Daily Cost": d.cost,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated Average Daily Cost</CardTitle>
        <CardDescription>
          Credit will update every few hours so we could not calculate the daily cost accurately. Therefore, the data is
          a reference only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart
          data={averageDailyCost}
          index="Date"
          categories={["Average Daily Cost"]}
          colors={["blue"]}
          yAxisWidth={48}
          className="h-64"
          valueFormatter={(value) => `S$${value.toFixed(2)}`}
        />
      </CardContent>
    </Card>
  );
}
