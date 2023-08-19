import { getCookie, getMeterCredit } from "@/lib/evs";
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
    const meter = await prisma.meter.findUnique({ where: { id: body.id } });

    if (!meter) {
      return NextResponse.json({ error: "Meter not found", data: requestData }, { status: 404 });
    }

    const cookie = await getCookie(meter);
    if (!cookie) {
      return NextResponse.json({ error: "Could not get cookie", data: requestData }, { status: 500 });
    }

    const meterCredit = await getMeterCredit(cookie);

    let latestMeterCredit = await prisma.meterCredit.findFirst({
      orderBy: { createdAt: "desc" },
      where: { meterId: meter.id },
    });

    if (!latestMeterCredit || latestMeterCredit.recordedAt < meterCredit.lastRecordedTimestamp) {
      const data = {
        type: "Credit Update",
        meterId: meter.id,
        credit: meterCredit.lastRecordedCredit - meterCredit.overusedValue,
        recordedAt: meterCredit.lastRecordedTimestamp,
      };

      latestMeterCredit = await prisma.meterCredit.create({ data });

      return NextResponse.json({
        status: "OK",
        message: "New meter credit data updated",
        data,
      });
    }

    return NextResponse.json({
      status: "OK",
      message: "No new meter credit data to update",
    });
  } catch (error: any) {
    if (error instanceof zod.ZodError) {
      return NextResponse.json(error.issues, { status: 400 });
    } else {
      console.error(error);
      return NextResponse.json(
        {
          error: "Internal server error",
          data: requestData,
        },
        { status: 500 }
      );
    }
  }
}
