import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto my-8">
      <h1 className="mb-4">NUS EVS Tracker</h1>
      <LoginForm />

      <p className="mt-4">
        Login with your NUS EVS credential to view your EVS credit. Your credit will be updated every 2 hours and you
        may track your EVS credit history.
      </p>

      <p className="mt-4">
        Disclaimer: This is a personal project and is not affiliated with NUS, NUS EVS, or any other. Your NUS EVS
        credential will be stored in our database. We will not use it for any other purpose other than update your EVS
        credit. By clicking login, I consent to share my username and password with the application and the balance
        history will be used for visualization purpose.
      </p>
    </main>
  );
}
