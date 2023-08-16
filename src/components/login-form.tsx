"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch("/api/meter", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.status === 200) {
      const json = await res.json();
      localStorage.setItem("meter-id", json.data.id);
      router.push("/meter/" + json.data.id);
    } else {
      setError(true);
      setLoading(false);
    }
  }

  const [meterId, setMeterId] = useState<string | null>(null);
  useEffect(() => {
    if (localStorage.getItem("meter-id")) {
      setMeterId(localStorage.getItem("meter-id"));
    }
  }, []);

  const [login, setLogin] = useState(false);

  return (
    <div className="text-center">
      {meterId && !login && (
        <div className="mb-2 flex justify-center gap-4">
          <Link href={"/meter/" + meterId}>
            <Button>View your meter</Button>
          </Link>
          <Button onClick={() => setLogin(true)}>Login Again</Button>
        </div>
      )}
      {(!meterId || login) && (
        <form className="flex sm:flex-row flex-col gap-2" onSubmit={onSubmit}>
          <Input type="text" name="username" placeholder="Username" disabled={loading} />
          <Input type="text" name="password" placeholder="Password" disabled={loading} />
          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>
      )}
      {error && <p className="text-red-500">Invalid username or password</p>}
    </div>
  );
}
