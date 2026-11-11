"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ApiError, apiClient } from "@/lib/api";
import { clearTokens, setTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiClient<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (typeof data.accessToken !== "string" || data.accessToken.length === 0) {
        throw new Error("Invalid Credentials.");
      }

      setTokens(data.accessToken, data.refreshToken);
      router.push(CONFIG.ROUTES.DASHBOARD);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        setError("Invalid Credentials.");
        return;
      }
      setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="relative z-10 bg-background text-foreground shadow-[2px_2px_5px_#c5c5c5,-2px_-2px_5px_#ffffff]">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"
        >
          <Link
            href="/"
            aria-label="OSHOPPE home"
            className="relative block h-14 w-[126px] shrink-0 overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3a3a3]"
          >
            <Image
              src="/oshoppe-logo.png"
              alt="OSHOPPE"
              width={174}
              height={174}
              priority
              className="absolute -left-6 -top-[46px] max-w-none"
            />
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium sm:gap-5">
            <Link
              href="/products"
              className="rounded-lg px-3 py-2 text-foreground transition-[color,box-shadow] hover:shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#ffffff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#737373]"
            >
              Browse
            </Link>
            <Link
              href="#about"
              className="rounded-lg px-3 py-2 text-foreground transition-[color,box-shadow] hover:shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#ffffff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#737373]"
            >
              About
            </Link>
            <Link
              href="#reviews"
              className="rounded-lg px-3 py-2 text-foreground transition-[color,box-shadow] hover:shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#ffffff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#737373]"
            >
              Reviews
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
        <Card className="grid h-auto min-h-[430px] w-full max-w-4xl grid-cols-1 gap-0 border-0 bg-card py-0 shadow-[0_20px_45px_rgba(15,23,42,0.12)] ring-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_55px_rgba(15,23,42,0.2)] motion-reduce:transition-none md:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col justify-center bg-black p-8 pt-6 sm:p-10 sm:pt-8 md:border-r md:border-[#262626]">
            <Image
              src="/oshoppe-login-mark.png"
              alt=""
              width={88}
              height={88}
              className="mb-6 size-16 object-contain sm:size-[88px]"
            />
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              <span className="block text-white">Welcome to</span>
              <span className="block bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#9a3412] bg-clip-text text-transparent">
                OSHOPPE
              </span>
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-[#d4d4d4]">
              Discover great products and keep your shopping orders all in one place.
            </p>
          </section>
          <section className="p-8 sm:p-10">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-3xl font-bold">Login</CardTitle>
              <CardDescription className="pt-1.5 text-left text-sm text-muted-foreground">
                Enter your credentials to access your account.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 px-0">
                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500 dark:border-red-900 dark:bg-red-950/50">
                    {error}
                  </div>
                )}
                <div className="space-y-2 text-left">
                  <Label htmlFor="username" className="text-sm">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    className="border-foreground/30"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    className="border-foreground/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 px-0 pt-6 pb-0">
                <Button type="submit" className="h-11 w-full border-0 bg-gradient-to-r from-[#f97316] to-[#c2410c] text-white shadow-[0_4px_10px_rgba(194,65,12,0.25)] transition-all hover:from-[#ea580c] hover:to-[#9a3412] hover:shadow-[0_5px_12px_rgba(194,65,12,0.3)]" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <div className="w-full border-t-1 border-foreground/20" />
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <a href={CONFIG.ROUTES.REGISTER} className="text-primary underline">
                    Register
                  </a>
                </p>
              </CardFooter>
            </form>
          </section>
        </Card>
      </main>

    </div>
  );
}
