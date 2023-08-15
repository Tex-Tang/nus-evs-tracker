"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      console.log(json);
      router.push("/meter/" + json.data.id);
    } else {
      setError(true);
    }

    setLoading(false);
  }

  return (
    <form className="flex gap-2" onSubmit={onSubmit}>
      <Input type="text" name="username" placeholder="Username" />
      <Input type="text" name="password" placeholder="Password" />
      <Button type="submit">Login</Button>

      {error && <p className="text-red-500">Invalid username or password</p>}
    </form>
  );
}
