import { parse } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { JSDOM } from "jsdom";
import zod from "zod";

export const meterSchema = zod.object({
  username: zod
    .string()
    .length(8)
    .regex(/^[0-9]+$/),
  password: zod.string().min(6).max(10),
});

export class EVSError extends Error {
  constructor(message: string) {
    super(`EVSError: ${message}`);
  }
}

export type Meter = Zod.infer<typeof meterSchema>;

function parseWithSingaporeTimezone(dateStr: string, format: string) {
  const parsedDate = parse(dateStr, format, new Date());
  return zonedTimeToUtc(parsedDate, "Asia/Singapore");
}

export async function getCookie(meter: Meter) {
  const res = await fetch("https://nus-utown.evs.com.sg/EVSEntApp-war/loginServlet", {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      Referer: "https://nus-utown.evs.com.sg",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: `txtLoginId=${meter.username}&txtPassword=${meter.password}&btnLogin=Login`,
    method: "POST",
  });

  const cookie = res.headers.get("Set-Cookie");

  if (!cookie?.includes("EVSEntApp-war")) {
    throw new EVSError("Could not login to EVS");
  }

  return cookie;
}

export async function listLatestTransactions(cookie: string) {
  const res = await fetch("https://nus-utown.evs.com.sg/EVSEntApp-war/listTransactionServlet", {
    headers: {
      cookie,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      Referer: "https://nus-utown.evs.com.sg/EVSEntApp-war/common/common_leftMenu.jsp",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });

  const body = await res.text();

  const document = new JSDOM(body).window.document;
  const rows = Array.from(document.querySelectorAll("table.mainContent table > tbody > tr.tblRow"));

  if (!rows) return null;

  const data = [];
  for (const row of rows) {
    data.push({
      timestamp: parseWithSingaporeTimezone(row.children[1].textContent ?? "", "dd/MM/yyyy HH:mm"),
      amount: Number(row.children[2].textContent?.trim() ?? 0),
    });
  }

  return data;
}

const ELEMENT_SELECTORS = {
  "meter-id": "#frmViewMeterCredit > table > tbody > tr:nth-child(4) > td:nth-child(2) > font",
  "total-balance": "#frmViewMeterCredit > table > tbody > tr:nth-child(4) > td:nth-child(3) > font",
  "last-recorded-credit": "#frmViewMeterCredit > table > tbody > tr:nth-child(8) > td:nth-child(2) > font",
  "last-recorded-timestamp": "#frmViewMeterCredit > table > tbody > tr:nth-child(9) > td:nth-child(2) > font",
  "overused-value": "#frmViewMeterCredit > table > tbody > tr:nth-child(12) > td:nth-child(2) > font",
  "overused-timestamp": "#frmViewMeterCredit > table > tbody > tr:nth-child(13) > td:nth-child(2) > font",
};

export type EVSMeterCredit = {
  meterId: string;
  totalBalance: number;
  lastRecordedCredit: number;
  lastRecordedTimestamp: Date;
  overusedValue?: number;
  overusedTimestamp?: Date;
};

export async function getMeterCredit(cookie: string) {
  const res = await fetch(`https://nus-utown.evs.com.sg/EVSEntApp-war/viewMeterCreditServlet`, {
    headers: {
      cookie,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      Referer: "https://nus-utown.evs.com.sg/EVSEntApp-war/common/common_leftMenu.jsp",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });

  const body = await res.text();

  const document = new JSDOM(body).window.document;

  const rows = document.querySelectorAll("#frmViewMeterCredit > table > tbody > tr");

  const data: Partial<EVSMeterCredit> = {};
  // @ts-ignore
  for (const row of rows) {
    const columns = row.querySelectorAll("td");
    if (columns.length < 2) continue;

    const columnTitle = columns[0].textContent?.trim();
    const columnValue = columns[1].textContent?.trim();
    if (!columnTitle || !columnValue) continue;

    if (columnTitle.includes("Last Recorded Timestamp")) {
      data.lastRecordedTimestamp = parseWithSingaporeTimezone(columnValue, "dd/MM/yyyy HH:mm:ss");
    } else if (columnTitle.includes("Last Recorded Credit")) {
      data.lastRecordedCredit = Number(columnValue.replace("S$", ""));
    } else if (columnTitle.includes("Meter ID")) {
      data.meterId = columnValue;
      const totalBalanceRaw = columns[2].textContent?.trim();
      if (totalBalanceRaw) {
        data.totalBalance = Number(totalBalanceRaw.replace("Total Balance: S$ ", ""));
      }
    } else if (columnTitle.includes("Overused Value")) {
      data.overusedValue = Number(columnValue.replace("$", ""));
    } else if (columnTitle.includes("Overused Timestamp")) {
      data.overusedTimestamp = parseWithSingaporeTimezone(columnValue, "dd/MM/yyyy HH:mm:ss");
    }
  }

  if (
    typeof data.meterId === "undefined" ||
    typeof data.lastRecordedCredit === "undefined" ||
    typeof data.lastRecordedTimestamp === "undefined" ||
    typeof data.totalBalance === "undefined"
  ) {
    throw new EVSError("Could not parse meter credit data");
  }

  return data as EVSMeterCredit;
}
