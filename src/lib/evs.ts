import { parse } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { JSDOM } from "jsdom";
import zod from "zod";

export const meterSchema = zod.object({
  username: zod
    .string()
    .length(8)
    .regex(/^[0-9]+$/),
  password: zod.string().min(6).max(8),
});

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

  const meterIdEl = document.querySelector("#frmViewMeterCredit > table > tbody > tr:nth-child(4) > td:nth-child(2)");

  const meterId = meterIdEl?.textContent?.trim();

  const lastRecordedCreditEl = document.querySelector(
    "#frmViewMeterCredit > table > tbody > tr:nth-child(8) > td:nth-child(2) > font"
  );
  const lastRecordedCredit = Number(lastRecordedCreditEl?.textContent?.replace("S$", "").trim());

  console.log;
  const lastRecordedTimestampEl = document.querySelector(
    "#frmViewMeterCredit > table > tbody > tr:nth-child(9) > td:nth-child(2) > font"
  );

  const lastRecordedTimestamp = parseWithSingaporeTimezone(
    lastRecordedTimestampEl?.textContent ?? "",
    "dd/MM/yyyy HH:mm:ss"
  );

  return {
    meterId,
    lastRecordedCredit,
    lastRecordedTimestamp,
  };
}
