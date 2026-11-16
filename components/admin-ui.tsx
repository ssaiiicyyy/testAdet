"use client";

import { useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import shopLogo from "../Orange_and_Black_Bold_Grunge_Digital_Marketing_Presentation__1_-removebg-preview.png";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

type AdminPage =
  | "Dashboard"
  | "Orders"
  | "Products"
  | "Transactions"
  | "Payments"
  | "Manufacturers"
  | "Customers";

const navigation: { label: AdminPage; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: CONFIG.ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Products", href: "/products", icon: Package },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Payments", href: "/payment", icon: CreditCard },
  { label: "Manufacturers", href: "/manufacturers", icon: Building2 },
  {
    label: "Customers",
    href: "/customers",
    icon: UserRound,
  },
];

export function AdminPageShell({
  activePage,
  searchLabel,
  searchPlaceholder,
  query,
  onQueryChange,
  children,
}: {
  activePage: AdminPage;
  searchLabel: string;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  children: ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    clearTokens();
    router.replace(CONFIG.ROUTES.LOGIN);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#fff9ed] text-[#2b1d16] lg:flex">
      <aside className="relative z-20 mx-3 mt-3 flex w-[calc(100%-1.5rem)] shrink-0 flex-col rounded-2xl bg-[#111111] px-4 py-4 text-white shadow-[0_4px_18px_rgba(0,0,0,0.22)] lg:fixed lg:bottom-3 lg:left-3 lg:top-3 lg:mx-0 lg:mt-0 lg:w-44 lg:px-3 lg:py-6">
        <Link
          href={CONFIG.ROUTES.DASHBOARD}
          aria-label="OSHOPPE dashboard"
          className="mb-4 flex w-fit items-center px-2 py-1 lg:mb-8"
        >
          <Image
            src={shopLogo}
            alt="OSHOPPE Online Ordering System"
            width={132}
            height={52}
            priority
            className="h-[52px] w-[132px] object-contain"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex gap-1 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible"
        >
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = label === activePage;
            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-y border-r border-y-[#f97316]/20 border-r-[#f97316]/20 border-l-[3px] border-l-[#f97316] bg-[linear-gradient(90deg,rgba(249,115,22,0.2)_0%,rgba(249,115,22,0.1)_100%)] text-[#ff781f]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon aria-hidden="true" size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400 lg:mt-4"
        >
          <LogOut aria-hidden="true" size={18} />
          Log out
        </button>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-[calc(11rem+1.5rem)]">
        <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#f1e7df] bg-[#fff0da] px-4 py-3 text-[#513a2e] sm:px-6 lg:px-8">
          <label className="flex h-10 w-full max-w-[296px] shrink-0 cursor-text items-center gap-2 rounded-full border border-[#e7d8cb] bg-white px-3 text-[#513a2e] shadow-sm focus-within:border-[#c83f08]">
            <Search aria-hidden="true" className="shrink-0" size={16} />
            <input
              type="search"
              aria-label={searchLabel}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#9b887d]"
            />
          </label>
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              aria-label="Settings"
              title="Settings"
              className="rounded-full border border-[#e7d8cb] bg-white p-2 text-[#513a2e] shadow-sm transition-colors hover:bg-[#fff0e8]"
            >
              <Settings aria-hidden="true" size={19} />
            </button>
            <button
              type="button"
              aria-label="Profile"
              title="Profile"
              className="rounded-full bg-[#ff4d00] p-2 text-white shadow-sm"
            >
              <UserRound aria-hidden="true" size={19} />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export function CrudModal({
  title,
  onClose,
  busy,
  children,
}: {
  title: string;
  onClose: () => void;
  busy: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        disabled={busy}
        className="absolute inset-0 cursor-default bg-black/25 backdrop-blur-[1px] disabled:cursor-wait"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="crud-dialog-title"
        className="relative z-10 w-full max-w-sm rounded-xl border border-[#f2e5d9] bg-white p-5 shadow-[0_16px_40px_rgba(43,29,22,0.2)] sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id="crud-dialog-title"
            className="text-base font-bold text-[#2b1d16]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-[#8b7569] transition-colors hover:bg-[#fff4e8] hover:text-[#2b1d16] disabled:opacity-50"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
