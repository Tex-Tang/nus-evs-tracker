import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";
import { redirect } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params: { id } }: PageProps) {
  const meter = await prisma.meter.findUnique({
    where: {
      id,
    },
  });

  if (!meter) redirect("/");

  const meterCredit = await prisma.meterCredit.findMany({
    where: {
      meter: { id },
    },
    orderBy: {
      recordedAt: "desc",
    },
  });

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <h1 className="text-2xl mb-4">{meter.username}</h1>
        <Link href="https://nus-utown.evs.com.sg/">
          <Button size="sm">Topup</Button>
        </Link>
      </div>
      <Table className="border">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Credit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meterCredit.map((credit) => (
            <TableRow key={credit.id}>
              <TableCell>{formatInTimeZone(credit.recordedAt, "Asia/Singapore", "dd MMM yyyy hh:mm:ss aa")}</TableCell>
              <TableCell>{credit.type}</TableCell>
              <TableCell>
                {credit.type == "Topup" && "+"}
                S$
                {credit.credit.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
