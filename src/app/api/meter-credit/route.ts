import { getCookie, getLatestTransaction, getMeterCredit } from "@/lib/evs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import zod from "zod";

const schema = zod.object({
  username: zod
    .string()
    .length(8)
    .regex(/^[0-9]+$/),
  password: zod.string().min(6).max(8),
});

export async function POST(request: Request) {
  try {
    const body = await schema.parseAsync(await request.json());
    const cookie = await getCookie({ username: body.username, password: body.password });
    if (!cookie) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const meter = await prisma.meter.findUnique({ where: { username: body.username } });

    if (!meter) {
      return NextResponse.json({ error: "Meter not found" }, { status: 404 });
    }

    const meterCredit = await getMeterCredit(cookie);

    const latestMeterCredit = await prisma.meterCredit.findFirst({
      orderBy: { createdAt: "desc" },
      where: { meterId: meter.id },
    });

    if (!latestMeterCredit || latestMeterCredit.recordedAt < meterCredit.lastRecordedTimestamp) {
      await prisma.meterCredit.create({
        data: {
          meterId: meter.id,
          credit: meterCredit.lastRecordedCredit,
          recordedAt: meterCredit.lastRecordedTimestamp,
        },
      });
    }

    const latestTransaction = await getLatestTransaction(cookie);
    if (latestTransaction) {
      const meterCredit = await prisma.meterCredit.findFirst({
        orderBy: { createdAt: "desc" },
        where: { meterId: meter.id, recordedAt: { lt: latestTransaction.timestamp } },
      });

      if (meterCredit) {
        await prisma.meterCredit.create({
          data: {
            meterId: meter.id,
            credit: meterCredit.credit + latestTransaction.amount,
            recordedAt: latestTransaction.timestamp,
          },
        });
      }
    }

    return NextResponse.json(meterCredit);
  } catch (error: any) {
    if (error instanceof zod.ZodError) {
      return NextResponse.json(error.issues, { status: 400 });
    } else {
      console.error(error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
}
