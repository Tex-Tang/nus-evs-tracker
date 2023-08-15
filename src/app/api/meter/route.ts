import { getCookie, getMeterCredit, meterSchema } from "@/lib/evs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import zod from "zod";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const body = await meterSchema.parseAsync(data);

    let meter = await prisma.meter.findUnique({ where: { username: body.username } });
    if (!meter) {
      const cookie = await getCookie({ username: body.username, password: body.password });
      if (!cookie) {
        return NextResponse.error();
      }

      meter = await prisma.meter.create({
        data: { username: body.username, password: body.password },
      });

      const meterCredit = await getMeterCredit(cookie);

      await prisma.meterCredit.create({
        data: {
          type: "Credit Update",
          meterId: meter.id,
          credit: meterCredit.lastRecordedCredit,
          recordedAt: meterCredit.lastRecordedTimestamp,
        },
      });
    }

    return NextResponse.json({
      status: "OK",
      data: { id: meter.id },
    });
  } catch (error: any) {
    if (error instanceof zod.ZodError) {
      return NextResponse.json(error.issues, { status: 400 });
    } else {
      console.error(error);
      return NextResponse.error();
    }
  }
}
