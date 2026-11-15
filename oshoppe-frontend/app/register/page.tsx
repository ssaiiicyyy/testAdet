"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import shopLogo from "../../Orange_and_Black_Bold_Grunge_Digital_Marketing_Presentation__1_-removebg-preview.png";
import promoImage from "../../Orange and Black Bold Grunge Digital Marketing Presentation (2).png";
import registerBag from "../../Orange_and_Black_Bold_Grunge_Digital_Marketing_Presentation-removebg-preview (1).png";
import { apiClient } from "@/lib/api";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), password }),
      });

      router.push(CONFIG.ROUTES.LOGIN);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#fffbed] px-4 py-8 pt-20 sm:px-8 sm:pt-24">
      <div className="absolute inset-x-4 top-5 z-10 mx-auto max-w-[900px] -translate-x-1 sm:inset-x-8 sm:top-7 sm:-translate-x-2">
        <Link
          href="/"
          aria-label="OSHOPPE home"
          className="relative block h-9 w-[108px] sm:h-11 sm:w-[132px]"
        >
          <Image
            src={shopLogo}
            alt="OSHOPPE"
            fill
            priority
            sizes="132px"
            className="object-contain object-left"
          />
        </Link>
      </div>
      <div className="relative isolate grid w-full max-w-[900px] grid-cols-1 gap-5 overflow-hidden rounded-[24px] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.74)_0%,rgba(255,255,255,0.48)_48%,rgba(255,255,255,0.62)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(255,255,255,0.72),0_24px_65px_rgba(38,32,14,0.2)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(120deg,rgba(255,255,255,0.32)_0%,transparent_38%,rgba(255,255,255,0.12)_72%,transparent_100%)] before:content-[''] sm:p-6 md:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] md:gap-10 md:p-7">
        <section className="relative z-10 flex min-h-[340px] overflow-hidden rounded-[17px] md:min-h-[520px]">
          <Image
            src={promoImage}
            alt="A shopper browsing products on a phone"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(249,115,22,0.22)_0%,transparent_48%),linear-gradient(to_top,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.1)_55%,rgba(0,0,0,0.08)_100%)]" />
          <div className="relative z-10 mt-auto w-full px-7 pb-9 text-white sm:px-8">
            <h2 className="border-b border-white/50 pb-3 text-[1.75rem] font-medium uppercase leading-[1.05] tracking-tight sm:text-[2rem]">
              Great <strong className="font-bold italic">deals</strong>,
              <br />
              great <strong className="font-bold italic">finds</strong>
            </h2>
            <p className="mt-4 max-w-[270px] text-[0.82rem] font-medium leading-[1.6] sm:text-sm">
              Discover great products and keep your shopping orders all in one place.
            </p>
          </div>
        </section>

        <section className="relative z-10 flex items-center px-2 py-6 sm:px-7 md:px-0">
          <div className="mx-auto w-full max-w-[380px]">
            <Image
              src={registerBag}
              alt=""
              width={42}
              height={46}
              className="mb-5 h-11 w-10 object-contain"
            />
            <h1 className="text-[1.75rem] font-bold leading-tight text-[#111] sm:text-[2rem]">
              Get Started
            </h1>
            <p className="mt-1.5 text-xs leading-[1.6] text-[#777263] sm:text-sm">
              Welcome to OSHOPPE! Let&apos;s get started.
            </p>

            <form onSubmit={handleRegister} className="mt-5">
              {error && (
                <div
                  role="alert"
                  className="mb-3 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-600"
                >
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-xs font-medium text-[#1b1b1b] sm:text-sm"
                >
                  Create a username
                </Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  className="h-10 rounded-md border-[#a8a29e] bg-white text-sm focus-visible:border-[#c2410c] focus-visible:ring-[#c2410c]/30"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mt-3 space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-[#1b1b1b] sm:text-sm"
                >
                  Create a password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="h-10 rounded-md border-[#a8a29e] bg-white text-sm focus-visible:border-[#c2410c] focus-visible:ring-[#c2410c]/30"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="mt-5 h-11 w-full rounded-md border-0 bg-gradient-to-r from-[#f97316] via-[#e65312] to-[#9a3412] text-sm font-semibold text-white shadow-[0_4px_12px_rgba(154,52,18,0.2)] transition-all hover:from-[#ea580c] hover:via-[#c2410c] hover:to-[#7c2d12]"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create an account"}
              </Button>
              <div className="my-4 flex items-center gap-3 text-xs text-[#858174]">
                <span className="h-px flex-1 bg-[#e9e7e2]" />
                <span>Or</span>
                <span className="h-px flex-1 bg-[#e9e7e2]" />
              </div>
              <div
                role="img"
                aria-label="Apple, Google, and Facebook"
                className="grid grid-cols-3 gap-4"
              >
                {[
                  ["apple", "Apple"],
                  ["google", "Google"],
                  ["facebook", "Facebook"],
                ].map(([icon, provider]) => (
                  <span
                    key={provider}
                    className="flex h-[38px] items-center justify-center rounded-md border border-[#dedbd5] bg-white"
                  >
                    <Image
                      src={`/${icon}.png`}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  </span>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-[#858174] sm:text-sm">
                Already have an account?{" "}
                <Link
                  href={CONFIG.ROUTES.LOGIN}
                  className="font-semibold text-[#df3f13] underline"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
