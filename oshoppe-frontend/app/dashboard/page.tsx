"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import shopLogo from "../../Orange_and_Black_Bold_Grunge_Digital_Marketing_Presentation__1_-removebg-preview.png";
import {
  Activity,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Filter,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingCart,
  UserRound,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

interface DashboardResponse {
  summary: {
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    totalOrderValue: number;
  };
  recentOrders: OrderRow[];
}

interface OrderRecord {
  order_id: number | string;
  order_date: string | null;
  order_status: string;
  total_amount: number | string;
  customer_id: number | string;
  product_id: number | string;
  quantity: number | string;
}

interface CustomerRecord {
  customer_id: number | string;
  customer_name: string;
}

interface ProductRecord {
  product_id: number | string;
  product_name: string;
}

interface OrderRow {
  orderId: number;
  customerName: string | null;
  productName: string | null;
  quantity: number;
  status: string;
  orderDate: string | null;
  totalAmount: number;
}

const navigation: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "#recent-orders", icon: ShoppingCart },
  { label: "Products", href: "/products", icon: Package },
  { label: "Manufacturers", href: "/manufacturers", icon: Building2 },
  { label: "Customers", href: "#customers", icon: UserRound },
];

const pageSizeOptions = [5, 10, 20];

function buildDashboard(
  orders: OrderRecord[],
  customers: CustomerRecord[],
  products: ProductRecord[],
): DashboardResponse {
  const customersById = new Map(
    customers.map((customer) => [Number(customer.customer_id), customer]),
  );
  const productsById = new Map(
    products.map((product) => [Number(product.product_id), product]),
  );

  return {
    summary: {
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalOrderValue: orders.reduce(
        (total, order) => total + Number(order.total_amount || 0),
        0,
      ),
    },
    recentOrders: orders
      .map((order) => ({
        orderId: Number(order.order_id),
        customerName:
          customersById.get(Number(order.customer_id))?.customer_name ?? null,
        productName:
          productsById.get(Number(order.product_id))?.product_name ?? null,
        quantity: Number(order.quantity),
        status: order.order_status,
        orderDate: order.order_date?.slice(0, 10) ?? null,
        totalAmount: Number(order.total_amount || 0),
      }))
      .sort((left, right) =>
        (right.orderDate ?? "").localeCompare(left.orderDate ?? ""),
      ),
  };
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function statusStyle(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes("complete") || normalized.includes("paid")) {
    return "bg-[#e7f5e9] text-[#256b35]";
  }
  if (normalized.includes("pending")) {
    return "border border-[#ffc95c] bg-[#fff4d6] text-[#8a5900]";
  }
  if (normalized.includes("cancel")) {
    return "bg-[#fee7e3] text-[#a83420]";
  }
  return "bg-[#f5eee8] text-[#684c3d]";
}

function SummaryCard({
  id,
  label,
  value,
  detail,
  icon: Icon,
  iconClass,
}: {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  iconClass: string;
}) {
  return (
    <article
      id={id}
      className="group/card scroll-mt-24 rounded-2xl border border-[#f2e5d9] bg-white p-4 shadow-[0_6px_18px_rgba(115,70,30,0.1)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(115,70,30,0.14)] active:translate-y-0 motion-reduce:transition-none sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-lg p-2.5 transition-transform duration-200 group-hover/card:scale-105 motion-reduce:transition-none ${iconClass}`}>
          <Icon aria-hidden="true" size={20} />
        </div>
        <Activity aria-hidden="true" className="text-[#d6c9bf]" size={19} />
      </div>
      <p className="mt-4 text-sm font-medium text-[#684c3d]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#21140f]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#8b7569]">{detail}</p>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: true });
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedOrder, setCopiedOrder] = useState<number | null>(null);
  useEffect(() => {
    if (isChecking) return;
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const [orders, customers, products] = await Promise.all([
          apiClient<OrderRecord[]>("/orders", { requiresAuth: true }),
          apiClient<CustomerRecord[]>("/customers", { requiresAuth: true }),
          apiClient<ProductRecord[]>("/product", { requiresAuth: true }),
        ]);
        const data = buildDashboard(orders, customers, products);
        if (active) setDashboard(data);
      } catch (loadError: unknown) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load dashboard data.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [isChecking]);

  const statuses = useMemo(
    () =>
      Array.from(
        new Set(
          (dashboard?.recentOrders ?? [])
            .map((order) => order.status.trim())
            .filter(Boolean),
        ),
      ),
    [dashboard],
  );

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (dashboard?.recentOrders ?? []).filter((order) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          order.orderId,
          order.customerName,
          order.productName,
          order.quantity,
          order.status,
          order.totalAmount,
        ].some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));
      const matchesStatus =
        statusFilter === "all" ||
        order.status.trim().toLowerCase() === statusFilter.toLowerCase();
      return matchesQuery && matchesStatus;
    });
  }, [dashboard, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const visibleOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const firstVisible = filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastVisible = Math.min(currentPage * pageSize, filteredOrders.length);

  const handleLogout = () => {
    clearTokens();
    router.replace(CONFIG.ROUTES.LOGIN);
    router.refresh();
  };

  const handleExport = () => {
    const columns = [
      "Order ID",
      "Customer",
      "Product",
      "Quantity",
      "Status",
      "Order Date",
      "Total",
    ];
    const quote = (value: string | number | null) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = filteredOrders.map((order) =>
      [
        order.orderId,
        order.customerName,
        order.productName,
        order.quantity,
        order.status,
        order.orderDate,
        order.totalAmount,
      ]
        .map(quote)
        .join(","),
    );
    const file = new Blob([[columns.map(quote).join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "recent-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyOrder = async (order: OrderRow) => {
    try {
      await navigator.clipboard.writeText(String(order.orderId));
      setCopiedOrder(order.orderId);
      window.setTimeout(() => setCopiedOrder(null), 1500);
    } catch (copyError: unknown) {
      setError(
        copyError instanceof Error
          ? `Could not copy order number: ${copyError.message}`
          : "Could not copy order number.",
      );
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff7ed]">
        <p className="text-sm text-[#8b7569]">Verifying session...</p>
      </div>
    );
  }

  const summary = dashboard?.summary;

  return (
    <div className="min-h-screen bg-[#fff7ed] text-[#2b1d16] lg:flex">
      <aside className="relative z-20 mx-3 mt-3 flex w-[calc(100%-1.5rem)] shrink-0 flex-col rounded-2xl bg-[#111111] px-4 py-4 text-white shadow-[0_4px_18px_rgba(0,0,0,0.22)] lg:fixed lg:bottom-3 lg:left-3 lg:top-3 lg:mx-0 lg:mt-0 lg:w-44 lg:px-3 lg:py-6">
        <a
          href="#dashboard"
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
        </a>

        <nav
          aria-label="Dashboard navigation"
          className="flex gap-1 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible"
        >
          {navigation.map(({ label, href, icon: Icon }, index) => (
            <a
              key={label}
              href={href}
              aria-current={index === 0 ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                index === 0
                  ? "border-y border-r border-y-[#f97316]/20 border-r-[#f97316]/20 border-l-[3px] border-l-[#f97316] bg-[linear-gradient(90deg,rgba(249,115,22,0.2)_0%,rgba(249,115,22,0.1)_100%)] text-[#ff781f] shadow-[inset_0_1px_0_rgba(255,140,50,0.12)] backdrop-blur-md"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon aria-hidden="true" size={18} />
              {label}
            </a>
          ))}
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

      <main id="dashboard" className="min-w-0 flex-1 lg:ml-[calc(11rem+1.5rem)]">
        <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#f1e7df] bg-[#fff7ed] px-4 py-3 text-[#513a2e] sm:px-6 lg:px-8">
          <label className="flex h-10 w-full max-w-[296px] shrink-0 cursor-text items-center gap-2 rounded-full border border-[#e7d8cb] bg-white px-3 text-[#513a2e] shadow-sm focus-within:border-[#c83f08]">
            <input
              type="search"
              aria-label="Search orders, products, customers"
              placeholder="Search orders, products, customers"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="min-w-0 flex-1 bg-transparent text-xs text-[#513a2e] outline-none placeholder:text-[#9b887d]"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="rounded-full px-1 text-[#8b7569] hover:bg-[#fff0e8]"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
            <Search aria-hidden="true" className="shrink-0" size={16} />
          </label>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              aria-label="Profile"
              title="Profile"
              className="rounded-full border border-[#e7d8cb] bg-white p-2 text-[#513a2e] shadow-sm transition-colors hover:bg-[#fff0e8]"
            >
              <UserRound aria-hidden="true" size={20} />
            </button>
            <button
              type="button"
              aria-label="Settings"
              title="Settings"
              className="rounded-full border border-[#e7d8cb] bg-white p-2 text-[#513a2e] shadow-sm transition-colors hover:bg-[#fff0e8]"
            >
              <Settings aria-hidden="true" size={20} />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c83f08]">
                Dashboard
              </p>
              <h1 className="font-sans text-3xl font-bold uppercase leading-none tracking-tight text-[#171717] sm:text-5xl">
                Hello, welcome back!
              </h1>
              <p className="mt-2 text-xs text-[#8b7569] sm:text-sm">
                Overview of your orders, products, and customers
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#e7d8cb] bg-white px-3 py-2 text-xs text-[#513a2e] shadow-sm">
              All-time totals
              <ChevronDown aria-hidden="true" size={14} />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#f0c7b1] bg-[#fff0e8] px-4 py-3 text-sm text-[#83310d]"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="font-semibold underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          <section aria-label="Business summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
           <SummaryCard
  id="total-orders"
  label="Total Orders"
  value={loading || !summary ? "—" : String(summary.totalOrders)}
  detail="Orders recorded"
  icon={ShoppingCart}
  iconClass="bg-[#ffedd5] text-[#c2410c] shadow-[inset_3px_3px_6px_#fed7aa,inset_-3px_-3px_6px_#ffffff]"
/>
  <SummaryCard
    id="products"
    label="Products"
    value={loading || !summary ? "—" : String(summary.totalProducts)}
    detail="Products in inventory"
    icon={Package}
    iconClass="bg-[#ffedd5] text-[#c2410c] shadow-[inset_3px_3px_6px_#fed7aa,inset_-3px_-3px_6px_#ffffff]"
/>
  <SummaryCard
    id="customers"
    label="Customers"
    value={loading || !summary ? "—" : String(summary.totalCustomers)}
    detail="Registered customers"
    icon={UserRound}
    iconClass="bg-[#fef3c7] text-[#b45309] shadow-[inset_3px_3px_6px_#fde68a,inset_-3px_-3px_6px_#ffffff]"
  />
  <SummaryCard
    id="total-order-value"
    label="Total Order Value"
    value={loading || !summary ? "—" : formatAmount(summary.totalOrderValue)}
    detail="Sum of recorded order amounts"
    icon={Wallet}
    iconClass="bg-[#fed7aa] text-[#9a3412] shadow-[inset_3px_3px_6px_#fdba74,inset_-3px_-3px_6px_#ffffff]"
  />

          </section>

          <section
            aria-labelledby="quick-actions-heading"
            className="flex flex-col gap-4 rounded-2xl bg-[linear-gradient(110deg,#111111_0%,#17110f_72%,#67351f_100%)] px-5 py-6 text-white shadow-[0_8px_24px_rgba(27,16,10,0.2)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div>
              <h2
                id="quick-actions-heading"
                className="text-sm font-semibold sm:text-base"
              >
                Quick actions
              </h2>
              <p className="mt-1 text-xs text-white/75">
                Record an order, add a product, or register a customer.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/orders"
                className="rounded-lg bg-[#c83f08] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#a93408]"
              >
                New order
              </Link>
              <Link
                href="/products"
                className="rounded-lg border border-white/30 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
              >
                Manage products
              </Link>
            </div>
          </section>

          <section
            id="recent-orders"
            aria-labelledby="orders-heading"
            className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#f2e5d9] bg-white text-[#2b1d16] shadow-[0_6px_20px_rgba(115,70,30,0.1)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e7df] px-4 py-4 sm:px-5">
              <h2
                id="orders-heading"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <ShoppingCart aria-hidden="true" className="text-[#c83f08]" size={16} />
                Recent Orders
              </h2>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 rounded-md border border-[#e7d8cb] bg-white px-2.5 py-2 text-xs text-[#684c3d]">
                  <Filter aria-hidden="true" size={14} />
                  <span className="sr-only">Filter by status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="max-w-28 bg-transparent text-[#513a2e] outline-none"
                  >
                    <option value="all">All statuses</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={filteredOrders.length === 0}
                  className="flex items-center gap-1.5 rounded-md bg-[#c83f08] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#a93408] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download aria-hidden="true" size={14} />
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left text-xs">
                <thead className="bg-[#fbf2e8] text-[#684c3d]">
                  <tr>
                    {["Order ID", "Customer", "Product", "Quantity", "Status", "Order Date", "Total", "Actions"].map((heading) => (
                      <th key={heading} scope="col" className="px-3 py-3 font-semibold sm:px-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1e7df]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[#8b7569]">
                        Loading orders...
                      </td>
                    </tr>
                  ) : visibleOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[#8b7569]">
                        {error ? "Order data is unavailable." : "No orders match your search."}
                      </td>
                    </tr>
                  ) : (
                    visibleOrders.map((order) => (
                      <tr key={order.orderId} className="transition-colors hover:bg-[#fffaf6]">
                        <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#513a2e] sm:px-4">
                          ORD-{order.orderId}
                        </td>
                        <td className="max-w-44 truncate px-3 py-3.5 font-medium text-[#513a2e] sm:px-4">
                          {order.customerName || "—"}
                        </td>
                        <td className="max-w-52 truncate px-3 py-3.5 text-[#684c3d] sm:px-4">
                          {order.productName || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-[#684c3d] sm:px-4">{order.quantity}</td>
                        <td className="px-3 py-3.5 sm:px-4">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyle(order.status)}`}>
                            {order.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-[#684c3d] sm:px-4">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#513a2e] sm:px-4">
                          {formatAmount(order.totalAmount)}
                        </td>
                        <td className="px-3 py-3.5 sm:px-4">
                          <button
                            type="button"
                            onClick={() => void handleCopyOrder(order)}
                            aria-label={`Copy order number ${order.orderId}`}
                            title={copiedOrder === order.orderId ? "Copied" : "Copy order number"}
                            className="rounded-full border border-[#eaded4] p-1.5 text-[#806b5e] transition-colors hover:bg-[#fff0e8] hover:text-[#c83f08]"
                          >
                            {copiedOrder === order.orderId ? (
                              <Check aria-hidden="true" size={15} />
                            ) : (
                              <Copy aria-hidden="true" size={15} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f1e7df] px-4 py-3 text-xs text-[#8b7569] sm:px-5">
              <p>
                Showing {firstVisible} to {lastVisible} of {filteredOrders.length} entries
              </p>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 sm:flex">
                  Rows per page
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-md border border-[#e7d8cb] bg-white px-2 py-1.5 text-[#513a2e]"
                    aria-label="Rows per page"
                  >
                    {pageSizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    className="rounded p-1.5 hover:bg-[#fff0e8] disabled:opacity-40"
                  >
                    <ChevronLeft aria-hidden="true" size={16} />
                  </button>
                  <span className="min-w-7 rounded bg-[#fff0e8] px-2 py-1.5 text-center font-semibold text-[#c83f08]">
                    {currentPage}
                  </span>
                  <span className="px-1">of {totalPages}</span>
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    className="rounded p-1.5 hover:bg-[#fff0e8] disabled:opacity-40"
                  >
                    <ChevronRight aria-hidden="true" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>

         
        </div>
      </main>
    </div>
  );
}
