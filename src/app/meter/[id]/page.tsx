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

  for (let i = 0; i < meterCredit.length - 1; i++) {
    if (meterCredit[i].type == "Topup") {
      meterCredit[i].type = `Topup (S$ ${meterCredit[i].credit.toFixed(2)})`;
      meterCredit[i].credit += meterCredit[i + 1].credit;
    }
  }

  return (
    <div>
      <div className="mb-2">
        <Link href="/" className="hover:underline">
          Back
        </Link>
      </div>
      <div className="flex justify-between items-baseline">
        <h1 className="text-2xl mb-4">{meter.username}</h1>
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
      <Table className="border">
        <TableCaption>A list of your recent balance history.</TableCaption>
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
              <TableCell>S$ {credit.credit.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
