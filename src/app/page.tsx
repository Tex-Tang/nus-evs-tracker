import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto my-8">
      <h1 className="mb-4">NUS EVS Tracker</h1>
      <LoginForm />

      <p className="mt-4">
        Disclaimer: This is a personal project and is not affiliated with NUS, NUS EVS, or any other. Your NUS EVS
        credential will be stored in our database. We will not use it for any other purpose other than update your EVS
        credit.
      </p>
    </main>
  );
}
