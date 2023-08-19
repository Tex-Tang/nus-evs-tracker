import Brand from "@/components/brand";
import { LoginForm } from "@/components/login-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Github } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto my-8">
      <Brand />
      <LoginForm />

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>How it works?</AccordionTrigger>
          <AccordionContent>
            Our system will login to NUS EVS portal using provided credential to retrieve your EVS credit in hourly
            manner. Therefore, you may track your EVS credit history{" "}
            <strong>from the day you login and not before.</strong>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Why we created this?</AccordionTrigger>
          <AccordionContent>
            We hope for a <strong>more transparent pricing</strong> for aircon usage in NUS. As far as we aware, NUS
            doesn't provide any way to track the pricing of aircon usage. We created this so that students can have the
            proof of following abnormal cases:
            <ul className="list-disc pl-5">
              <li className="font-medium">Phantom/Random deduction when you are not even in your room.</li>
              <li className="font-medium">Over-priced issue</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>How we will use your username and password?</AccordionTrigger>
          <AccordionContent>
            We will use your username and password to login to NUS EVS portal and retrieve your{" "}
            <strong>EVS credit and Topup history</strong>. We won't be able to retrieve your personal information or any
            related information (Room Number etc).
            <br />
            <br />
            However, we cannot guarantee that your credential will be <strong>100% safe with us</strong>. If you are not
            comfortable with this, you may consider to self-host this project on your own. If you would like to
            contribute to this project in order to make it more secure, you may consider to contribute us on{" "}
            <Link className="hover:underline" href="https://github.com/Tex-Tang/nus-evs-tracker">
              GitHub
            </Link>
            .
            <br />
            <br />
            Side Note: People who has your credential can login to NUS EVS portal will be able to topup for you, check
            your EVS credit and know the room of where aircon located. However, they won't be able to retrieve your
            personal information.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <p className="my-4 text-xs text-gray-600">
        Disclaimer: This is a personal project and is not affiliated with NUS, NUS EVS, or any other. Your NUS EVS
        credential will be stored in our database. We will not use it for any other purpose other than tracking your EVS
        credit.
      </p>

      <footer>
        <div className="text-center mt-4">
          <Link className="hover:underline" href="https://github.com/Tex-Tang/nus-evs-tracker">
            Contribute us on <Github className="inline relative -top-0.5" /> GitHub
          </Link>
        </div>
      </footer>
    </main>
  );
}
