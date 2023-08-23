import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MeterCredit } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";
import { cloneDeep } from "lodash";

type MeterCreditTableProps = {
  meterCredits: MeterCredit[];
};

export function MeterCreditTable({ meterCredits }: MeterCreditTableProps) {
  const tableData = cloneDeep(meterCredits)
    .reduceRight<MeterCredit[]>((acc, curr) => {
      if (curr.type == "Topup") {
        curr.type = `Topup (S$ ${curr.credit.toFixed(2)})`;
        curr.credit += acc[acc.length - 1].credit;
        acc.push(curr);
      } else {
        acc.push(curr);
      }
      return acc;
    }, [])
    .reverse();

  return (
    <Table className="border">
      <TableCaption>A list of your recent balance history.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead className="hidden sm:table-cell">Type</TableHead>
          <TableHead>Credit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableData.map((credit) => (
          <TableRow key={credit.id}>
            <TableCell>
              {formatInTimeZone(credit.recordedAt, "Asia/Singapore", "dd MMM yyyy HH:mm:ss aa")}
              <span className="sm:hidden">
                <br />
                {credit.type}
              </span>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{credit.type}</TableCell>
            <TableCell>S$ {credit.credit.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
