import Brand from "@/components/brand";
import { LoginForm } from "@/components/login-form";
import { Github } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto my-8">
      <Brand />
      <LoginForm />
      <div className="flex flex-col gap-4">
        <p className="mt-4">
          Login with your NUS EVS credential to view your EVS credit. Your credit will be updated every 2 hours and you
          may track your EVS credit history.
        </p>
        <p>
          <strong>Why we created this?</strong> <br />
          As far as we aware, NUS doesn't provide any way to check the pricing of aircon usage. We created this to
          provide a way for students to track their EVS credit and usage history. At the same time, we can have a
          dataset to analyze the aircon usage in NUS.
        </p>

        <p>
          <strong>What we will use your username and password for?</strong>
          <br />
          We will use your username and password to login to NUS EVS portal and retrieve your{" "}
          <strong>EVS credit and Topup history</strong>. We won't be able to retrieve your personal information or any
          related information (Room Number).
        </p>

        <p>
          Disclaimer: This is a personal project and is not affiliated with NUS, NUS EVS, or any other. Your NUS EVS
          credential will be stored in our database. We will not use it for any other purpose other than tracking your
          EVS credit.
        </p>
      </div>
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
