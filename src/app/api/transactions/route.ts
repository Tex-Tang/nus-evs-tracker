import { getCookie, listLatestTransactions } from "@/lib/evs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import zod from "zod";

const schema = zod.object({
  id: zod.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await schema.parseAsync(await request.json());
    const meter = await prisma.meter.findUnique({ where: { id: body.id } });

    if (!meter) {
      return NextResponse.json({ error: "Meter not found" }, { status: 404 });
    }

    const cookie = await getCookie(meter);
    if (!cookie) {
      return NextResponse.json({ error: "Could not get cookie" }, { status: 500 });
    }

    const latestTransactions = await listLatestTransactions(cookie);

    let latestMeterCredit = await prisma.meterCredit.findFirst({
      orderBy: { createdAt: "desc" },
      where: { meterId: meter.id },
    });

    const transactionsToUpdate =
      latestTransactions?.filter((transaction) => transaction.timestamp > latestMeterCredit!.recordedAt) || [];

    await prisma.meterCredit.createMany({
      data: transactionsToUpdate.map((transaction) => ({
        type: "Topup",
        meterId: meter.id,
        credit: transaction.amount,
        recordedAt: transaction.timestamp,
      })),
    });

    return NextResponse.json(transactionsToUpdate);
  } catch (error: any) {
    if (error instanceof zod.ZodError) {
      return NextResponse.json(error.issues, { status: 400 });
    } else {
      console.error(error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
}