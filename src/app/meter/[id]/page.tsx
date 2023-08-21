import { MeterBarChart } from "@/components/meter-bar-chart";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { MeterCredit } from "@prisma/client";
import { differenceInHours } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";
import { redirect } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

type MeterCreditWithChange = MeterCredit & {
  change?: number;
  lastUpdatedInHours?: number;
};

export default async function Page({ params: { id } }: PageProps) {
  const meter = await prisma.meter.findUnique({ where: { id } });

  if (!meter) redirect("/");

  const tableData = await prisma.meterCredit
    .findMany({
      where: {
        meter: { id },
      },
      orderBy: {
        recordedAt: "desc",
      },
    })
    .then((data) =>
      data
        .reduceRight<MeterCreditWithChange[]>((acc, curr: MeterCreditWithChange) => {
          if (curr.type == "Topup") {
            curr.credit += acc[acc.length - 1].credit;
            acc.push(curr);
          } else {
            acc.push(curr);
          }

          if (acc.length >= 2) {
            curr.lastUpdatedInHours = differenceInHours(acc[acc.length - 1].recordedAt, acc[acc.length - 2].recordedAt);
            curr.change = acc[acc.length - 1].credit - acc[acc.length - 2].credit;
          }
          return acc;
        }, [])
        .reverse()
    );

  const graphData = await prisma.meterCredit
    .findMany({
      select: {
        id: true,
        type: true,
        credit: true,
        recordedAt: true,
      },
      where: { meter: { id } },
      orderBy: { recordedAt: "desc" },
      take: 20,
    })
    .then((data) =>
      data
        .map((credit) => ({
          ...credit,
          recordedAt: formatInTimeZone(credit.recordedAt, "Asia/Singapore", "dd MMM yyyy HH:mm:ss aa"),
        }))
        .reverse()
    );

  return (
    <div>
      <div className="mb-2">
        <Link href="/" className="hover:underline">
          Back
        </Link>
      </div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl">{meter.username}</h1>
        <form method="POST" action="https://nus-utown.evs.com.sg/EVSWebPOS/loginServlet" target="_blank">
          <input type="hidden" name="txtMtrId" value={meter.username} />
          <input type="hidden" name="radRetail" value="1" />
          <Button type="submit" name="btnLogin" value="Submit" size="sm">
            Topup
          </Button>
        </form>
      </div>
      <p className="mb-4">
        Please note that the meter balance may not be updated immediately after a topup. If you have just topped up,
        please wait for an hour before checking your balance or check directly at{" "}
        <Link href="https://nus-utown.evs.com.sg/EVSEntApp-war/listTransactionServlet" className="hover:underline">
          EVS portal
        </Link>{" "}
        directly.
      </p>
      <MeterBarChart data={graphData} />
      <Table className="border text-xs sm:text-sm">
        <TableCaption>A list of your recent balance history.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead className="hidden sm:table-cell">Type</TableHead>
            <TableHead className="min-w-[80px]">Change</TableHead>
            <TableHead className="min-w-[80px]">Credit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((credit, i) => (
            <TableRow key={credit.id}>
              <TableCell>
                {formatInTimeZone(credit.recordedAt, "Asia/Singapore", "dd MMM yyyy HH:mm aa")}
                <span className="sm:hidden">
                  <br />
                  {credit.type}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{credit.type}</TableCell>
              <TableCell className="font-mono">
                {typeof credit.change == "number"
                  ? (credit.change >= 0 ? "+S$ " : "-S$ ") + Math.abs(credit.change).toFixed(2)
                  : ""}
              </TableCell>
              <TableCell className="font-mono">S$ {credit.credit.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
