import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
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
      <h1 className="text-2xl mb-4">{meter.username}</h1>
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
              <TableCell>{credit.recordedAt.toISOString()}</TableCell>
              <TableCell>{credit.type}</TableCell>
              <TableCell>{credit.credit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
