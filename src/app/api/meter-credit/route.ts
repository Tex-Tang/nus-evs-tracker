import { EVSError, getCookie, getMeterCredit } from "@/lib/evs";
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
      return NextResponse.json({ error: "Meter not found", data: requestData }, { status: 404 });
    }

    const cookie = await getCookie(meter);
    if (!cookie) {
      return NextResponse.json({ error: "Could not get cookie", data: requestData }, { status: 500 });
    }

    const meterCredit = await getMeterCredit(cookie);

    const latestCredit =
      meterCredit.totalBalance && meterCredit.overusedValue
        ? meterCredit.totalBalance - meterCredit.overusedValue
        : meterCredit.totalBalance;

    const latestMeterCredit = meter.MeterCredit.length > 0 ? meter.MeterCredit[0] : null;

    const data = {
      meterId: meter.id,
      type: "Credit Update",
      credit: latestCredit,
      recordedAt: meterCredit.lastRecordedTimestamp,
    };

    if (!latestMeterCredit || latestMeterCredit.recordedAt < meterCredit.lastRecordedTimestamp) {
      await prisma.meterCredit.create({ data });

      return NextResponse.json({ message: "New meter credit data updated", data });
    }

    return NextResponse.json({ message: "No new meter credit data to update", data });
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
