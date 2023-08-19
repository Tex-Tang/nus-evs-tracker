import { EVSError, getCookie, listLatestTransactions } from "@/lib/evs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import zod from "zod";

const schema = zod.object({
  id: zod.string().uuid(),
});

export async function POST(request: Request) {
  const requestData = await request.json();

  try {
    const body = await schema.parseAsync(requestData);

    const meter = await prisma.meter.findUnique({
      where: {
        id: body.id,
      },
      select: {
        id: true,
        username: true,
        password: true,
        MeterCredit: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    });
    if (!meter) {
      return NextResponse.json({ error: "Meter not found" }, { status: 404 });
    }

    const latestMeterCredit = meter.MeterCredit.length > 0 ? meter.MeterCredit[0] : null;
    if (!latestMeterCredit) {
      return NextResponse.json({ status: "OK", message: "No meter credit data found" });
    }

    const cookie = await getCookie(meter);
    if (!cookie) return NextResponse.json({ error: "Could not get cookie" }, { status: 500 });

    const latestTransactions = await listLatestTransactions(cookie);

    const transactionsToUpdate =
      latestTransactions?.filter((transaction) => transaction.timestamp > latestMeterCredit.recordedAt) || [];

    if (transactionsToUpdate.length === 0) {
      return NextResponse.json({ message: "No new topup data found", data: latestTransactions });
    }

    const data = transactionsToUpdate.map((transaction) => ({
      type: "Topup",
      meterId: meter.id,
      credit: transaction.amount,
      recordedAt: transaction.timestamp,
    }));

    await prisma.meterCredit.createMany({ data });

    return NextResponse.json({ message: "New topup data updated", data });
  } catch (error: any) {
    if (error instanceof zod.ZodError) {
      return NextResponse.json(error.issues, { status: 400 });
    } else if (error instanceof EVSError) {
      return NextResponse.json({ error: error.message, data: requestData }, { status: 401 });
    } else {
      console.error(error);
      return NextResponse.json({ error: "Internal server error", data: requestData }, { status: 500 });
    }
  }
}
