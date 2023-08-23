"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { Button } from "../ui/button";

type TopUpButtonProps = {
  username: string;
};

export function TopUpButton({ username }: TopUpButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" type="button">
          Top Up
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <p className="text-xs mb-4 text-gray-700">
          We will redirect you to EVS portal to topup your credit and we will not store any related payment information.
          The meter credit won{"'"}t updated immediately after topup. If you have just topped up, please wait for an
          hour before checking your credit balance or you may check directly at{" "}
          <Link
            href="https://nus-utown.evs.com.sg/EVSEntApp-war/listTransactionServlet"
            className="hover:underline text-blue-500"
          >
            EVS portal
          </Link>{" "}
          directly.
        </p>
        <form method="POST" action="https://nus-utown.evs.com.sg/EVSWebPOS/loginServlet" target="_blank">
          <input type="hidden" name="txtMtrId" value={username} />
          <input type="hidden" name="radRetail" value="1" />
          <Button type="submit" name="btnLogin" value="Submit" size="sm">
            Redirect now
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
