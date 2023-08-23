import { AverageDailyCostChart } from "@/components/meter/average-daily-cost-chart";
import { CreditTrendChart } from "@/components/meter/credit-trend-chart";
import { MeterCreditTable } from "@/components/meter/meter-credit-table";
import { TopUpButton } from "@/components/meter/top-up-button";
import { prisma } from "@/lib/prisma";
import { addDays, endOfMonth, startOfMonth, subDays } from "date-fns";
import { redirect } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params: { id } }: PageProps) {
  const meter = await prisma.meter.findUnique({ where: { id } });

  if (!meter) redirect("/");

  const meterCredits = await prisma.meterCredit.findMany({
    where: {
      meter: { id },

      recordedAt: {
        gte: subDays(startOfMonth(new Date()), 1),
        lte: addDays(endOfMonth(new Date()), 1),
      },
    },
    orderBy: { recordedAt: "desc" },
  });

  return (
    <div className="flex max-w-6xl mx-auto md:flex-row flex-col flex-wrap gap-y-4">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl">{meter.username}</h1>
        <TopUpButton username={meter.username} />
      </div>
      <div className="md:w-1/2 md:pr-4 flex flex-col gap-4 order-2 md:order-1">
        <MeterCreditTable meterCredits={meterCredits} />
      </div>
      <div className="md:w-1/2 flex flex-col gap-4 order-1 md:order-2">
        <AverageDailyCostChart data={meterCredits} />
        <CreditTrendChart data={meterCredits} />
      </div>
    </div>
  );
}
