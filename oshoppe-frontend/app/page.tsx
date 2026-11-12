import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import heroArt from "../Orange_and_Black_Bold_Grunge_Digital_Marketing_Presentation-removebg-preview.png";
import shopLogo from "../Orange_and_Black_Bold_Grunge_Digital_Marketing_Presentation__1_-removebg-preview.png";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <div className="w-full overflow-hidden bg-black">
        <header className="relative z-10 mx-5 mt-3 rounded-full border border-white/[0.2] bg-[linear-gradient(110deg,rgba(46,46,46,0.76)_0%,rgba(29,29,29,0.66)_52%,rgba(18,18,18,0.76)_100%)] py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:mx-8 sm:mt-5 lg:mx-auto lg:max-w-[1280px]">
          <nav className="mx-auto flex max-w-[1180px] items-center justify-between gap-3">
            <Link href="/" aria-label="OSHOPPE home" className="relative block h-[40px] w-[108px] shrink-0 sm:h-[48px] sm:w-[142px]">
              <Image src={shopLogo} alt="OSHOPPE" fill priority sizes="142px" className="object-contain" />
            </Link>

            <div className="hidden items-center gap-1 text-[15px] font-medium text-white sm:flex">
              <Link href="#about" className="rounded-full border border-white/[0.14] bg-white/[0.12] px-4 py-2.5 transition-colors hover:bg-white/[0.18] hover:text-[#fdb58b]">
                About
              </Link>
              <Link href="/products" className="rounded-full px-4 py-2.5 transition-colors hover:bg-white/[0.08] hover:text-[#fdb58b]">
                Browse
              </Link>
              <Link href="#reviews" className="rounded-full px-4 py-2.5 transition-colors hover:bg-white/[0.08] hover:text-[#fdb58b]">
                Reviews
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-white sm:gap-3 sm:text-sm">
              <Link
                href="/login"
                className="rounded-full border border-white/[0.14] bg-white/[0.04] px-3 py-2.5 transition-colors hover:border-white/30 hover:bg-white/[0.1] sm:px-5"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#ff6d2d] px-3 py-2.5 text-black shadow-[0_4px_16px_rgba(255,109,45,0.2)] transition-colors hover:bg-[#ff8148] sm:px-5"
              >
                Sign up
              </Link>
            </div>
          </nav>
        </header>

        <section className="relative isolate overflow-hidden bg-[#050505] px-5 pb-12 pt-9 sm:px-8 sm:pb-16 sm:pt-12 lg:px-12 lg:pb-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_4%_43%,rgba(236,66,34,0.7),transparent_30%),linear-gradient(180deg,#050505_0%,#080706_72%,#030303_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-[18%] top-[20%] -z-10 h-[66%] w-[138%] rotate-[8deg] rounded-[50%] border-b-[20px] border-[#ff6a2c]/80 opacity-75 blur-[25px]"
          />

          <div className="relative mx-auto grid max-w-[1280px] items-center gap-4 lg:min-h-[620px] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative z-10 max-w-[570px] py-5 text-[#fff9e9] sm:py-8">
              <div className="mb-5 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.01em] text-[#fef2eb] sm:mb-6 sm:text-[14px]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/[0.14] bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.035))] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_14px_rgba(0,0,0,0.25)]">
                  <ShoppingCart aria-hidden="true" size={18} strokeWidth={1.8} className="text-[#ff6d2d]" />
                </span>
                <span>Welcome to OSHOPPE</span>
              </div>

              <h1 className="font-heading text-[4.25rem] leading-[0.9] tracking-[0.015em] text-[#fff9e9] sm:text-[6rem] lg:text-[7.6rem]">
                ONE CLICK
              </h1>

              <p className="mt-4 inline-block -rotate-2 rounded-[15px] bg-[#c95432] px-5 py-2.5 font-heading text-[1.4rem] leading-none text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] sm:px-7 sm:text-[1.8rem]">
                EVERYTHING IS IN PLACE
              </p>

              <p className="mt-6 max-w-[500px] text-[1rem] leading-[1.65] text-[#fff1e9] sm:text-[1.08rem]">
                Discover a convenient and enjoyable way to shop with OSHOPPE! Explore a wide variety of products,
                find your everyday essentials, and discover items that match your needs and preferences.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-[#ff6d2d] px-7 py-3 text-[15px] font-semibold text-black shadow-[0_8px_24px_rgba(255,109,45,0.2)] transition-colors hover:bg-[#ff8148]"
                >
                  Get Started
                </Link>
                <Link
                  href="#about"
                  className="rounded-full border border-white/[0.18] bg-[linear-gradient(110deg,rgba(255,109,45,0.2),rgba(255,255,255,0.04))] px-7 py-3 text-[15px] font-semibold text-[#fff9e9] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:border-white/30 hover:bg-white/[0.1]"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="relative mx-auto flex aspect-square w-[112%] max-w-[640px] items-center justify-center lg:-mr-8">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#f28a45_0%,#d95d2e_52%,rgba(201,84,50,0)_76%)] opacity-25 blur-3xl"
              />
              <Image
                src={heroArt}
                alt="Shopping cart filled with OSHOPPE finds, surrounded by gifts and a payment card"
                priority
                sizes="(max-width: 1024px) 100vw, 640px"
                className="relative z-10 h-full w-full object-contain drop-shadow-[0_24px_32px_rgba(85,37,20,0.14)]"
              />
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
