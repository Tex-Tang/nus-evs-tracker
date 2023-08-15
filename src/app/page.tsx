import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto my-8">
      <h1 className="mb-4">NUS EVS Tracker</h1>
      <LoginForm />
    </main>
  );
}
