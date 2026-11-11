"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Check,
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
  { label: "Products", href: "#products", icon: Package },
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
    return "bg-[#e5e5e5] text-[#171717]";
  }
  if (normalized.includes("pending")) {
    return "bg-[#d4d4d4] text-[#171717]";
  }
  if (normalized.includes("cancel")) {
    return "bg-[#737373] text-white";
  }
  return "bg-[#f5f5f5] text-[#262626]";
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
      className="group/card scroll-mt-24 rounded-2xl border border-[#eeeeee] bg-[#e5e5e5] p-4 shadow-[8px_8px_16px_#c5c5c5,-8px_-8px_16px_#ffffff] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[12px_12px_22px_#c5c5c5,-12px_-12px_22px_#ffffff] active:translate-y-0 motion-reduce:transition-none sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-lg p-2.5 transition-transform duration-200 group-hover/card:scale-105 motion-reduce:transition-none ${iconClass}`}>
          <Icon aria-hidden="true" size={20} />
        </div>
        <Activity aria-hidden="true" className="text-[#a3a3a3]" size={19} />
      </div>
      <p className="mt-4 text-sm font-medium text-[#525252]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#0a0a0a]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#737373]">{detail}</p>
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
      <div className="flex min-h-screen items-center justify-center bg-[#e5e5e5]">
        <p className="text-sm text-[#737373]">Verifying session...</p>
      </div>
    );
  }

  const summary = dashboard?.summary;

  return (
    <div className="min-h-screen bg-[#e5e5e5] text-[#171717] lg:flex">
      <aside className="relative z-20 flex w-full shrink-0 flex-col border-[#0a0a0a] bg-[#171717] px-4 py-4 text-white shadow-[4px_4px_10px_#0d0d0d,-3px_-3px_8px_#202020] lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-r lg:px-3 lg:py-6 lg:shadow-[5px_0_12px_#0d0d0d,-3px_0_8px_#202020]">
        <a
          href="#dashboard"
          className="mb-4 flex items-center gap-3 px-2 py-1 lg:mb-8"
        >
          <span className="grid size-10 place-items-center rounded-lg bg-[#171717] text-white shadow-[inset_2px_2px_4px_#0a0a0a,inset_-2px_-2px_4px_#262626]">
            <Package aria-hidden="true" size={24} />
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight">OSHOPPE</span>
            <span className="block text-[11px] text-[#a3a3a3]">
              Online Ordering System
            </span>
          </span>
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
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-[#171717] text-white shadow-[inset_2px_2px_5px_#0a0a0a,inset_-2px_-2px_5px_#262626]"
                  : "text-[#d4d4d4] hover:bg-[#1c1c1c] hover:text-white hover:shadow-[2px_2px_5px_#0a0a0a,-2px_-2px_5px_#262626]"
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
          className="mt-3 flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#d4d4d4] transition-all hover:bg-[#1c1c1c] hover:text-white hover:shadow-[2px_2px_5px_#0a0a0a,-2px_-2px_5px_#262626] lg:mt-4"
        >
          <LogOut aria-hidden="true" size={18} />
          Log out
        </button>
      </aside>

      <main id="dashboard" className="min-w-0 flex-1 lg:ml-60">
        <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#0a0a0a] bg-[#171717] px-4 py-3 text-white shadow-[3px_3px_8px_#0d0d0d,-2px_-2px_6px_#202020] sm:px-6 lg:px-8">
          <label className="group/search flex h-10 w-10 shrink-0 cursor-text items-center justify-end gap-2 overflow-hidden rounded-full border border-transparent bg-[#171717] px-2 text-white shadow-[inset_2px_2px_5px_#0a0a0a,inset_-2px_-2px_5px_#262626] transition-[width,border-color,padding] duration-300 hover:w-72 hover:border-[#373737] hover:px-4 focus-within:w-72 focus-within:border-[#373737] focus-within:px-4 sm:hover:w-80 sm:focus-within:w-80">
            <input
              type="search"
              aria-label="Search orders"
              placeholder="Search orders, customers, products..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-white opacity-0 outline-none transition-opacity duration-200 placeholder:text-white/25 group-hover/search:opacity-100 group-focus-within/search:opacity-100"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="rounded-full px-1 text-[#d4d4d4] hover:bg-[#262626]"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
            <Search aria-hidden="true" className="shrink-0" size={20} />
          </label>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              aria-label="Profile"
              title="Profile"
              className="rounded-full bg-[#171717] p-2 text-white shadow-[2px_2px_5px_#0a0a0a,-2px_-2px_5px_#262626] transition-shadow hover:shadow-[inset_2px_2px_4px_#0a0a0a,inset_-2px_-2px_4px_#262626]"
            >
              <UserRound aria-hidden="true" size={20} />
            </button>
            <button
              type="button"
              aria-label="Settings"
              title="Settings"
              className="rounded-full bg-[#171717] p-2 text-white shadow-[2px_2px_5px_#0a0a0a,-2px_-2px_5px_#262626] transition-shadow hover:shadow-[inset_2px_2px_4px_#0a0a0a,inset_-2px_-2px_4px_#262626]"
            >
              <Settings aria-hidden="true" size={20} />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-[#737373] pb-2">
                Dashboard
              </h1>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
                HELLO, WELCOME BACK!
              </h1>
              <p className="mt-1 text-sm text-[#737373]">
                Overview of your orders, products, and customers
              </p>
            </div>
            <div className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#525252] shadow-sm">
              All-time totals
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d4d4d4] bg-[#f5f5f5] px-4 py-3 text-sm text-[#262626]"
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

          <section aria-label="Business summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            id="recent-orders"
            aria-labelledby="orders-heading"
            className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#e5e5e5] bg-[#d4d4d4] text-[#171717] shadow-[8px_8px_16px_#b8b8b8,-8px_-8px_16px_#eeeeee]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4d4d4] px-4 py-4 sm:px-5">
              <h2
                id="orders-heading"
                className="flex items-center gap-2 text-base font-semibold"
              >
                <ShoppingCart aria-hidden="true" size={19} />
                Recent Orders
              </h2>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 rounded-md border border-[#c5c5c5] bg-[#d4d4d4] px-2.5 py-2 text-xs text-[#525252] shadow-[inset_2px_2px_4px_#b8b8b8,inset_-2px_-2px_4px_#eeeeee]">
                  <Filter aria-hidden="true" size={14} />
                  <span className="sr-only">Filter by status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="max-w-28 bg-transparent text-[#262626] outline-none"
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
                  className="flex items-center gap-1.5 rounded-md bg-[#171717] px-3 py-2 text-xs font-semibold text-white shadow-[3px_3px_6px_#c5c5c5,-3px_-3px_6px_#ffffff] transition hover:-translate-y-0.5 hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download aria-hidden="true" size={14} />
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left text-xs">
                <thead className="bg-[#c9c9c9] text-[#262626]">
                  <tr>
                    {["Order ID", "Customer", "Product", "Quantity", "Status", "Order Date", "Total", "Actions"].map((heading) => (
                      <th key={heading} scope="col" className="px-3 py-3 font-semibold sm:px-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4d4d4]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[#737373]">
                        Loading orders...
                      </td>
                    </tr>
                  ) : visibleOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[#737373]">
                        {error ? "Order data is unavailable." : "No orders match your search."}
                      </td>
                    </tr>
                  ) : (
                    visibleOrders.map((order) => (
                      <tr key={order.orderId} className="transition-colors hover:bg-[#eeeeee]">
                        <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#404040] sm:px-4">
                          ORD-{order.orderId}
                        </td>
                        <td className="max-w-44 truncate px-3 py-3.5 font-medium text-[#262626] sm:px-4">
                          {order.customerName || "—"}
                        </td>
                        <td className="max-w-52 truncate px-3 py-3.5 text-[#525252] sm:px-4">
                          {order.productName || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-[#404040] sm:px-4">{order.quantity}</td>
                        <td className="px-3 py-3.5 sm:px-4">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyle(order.status)}`}>
                            {order.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-[#404040] sm:px-4">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-[#404040] sm:px-4">
                          {formatAmount(order.totalAmount)}
                        </td>
                        <td className="px-3 py-3.5 sm:px-4">
                          <button
                            type="button"
                            onClick={() => void handleCopyOrder(order)}
                            aria-label={`Copy order number ${order.orderId}`}
                            title={copiedOrder === order.orderId ? "Copied" : "Copy order number"}
                            className="rounded p-1.5 text-[#737373] transition-colors hover:bg-[#e5e5e5] hover:text-[#171717]"
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

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d4d4d4] px-4 py-3 text-xs text-[#737373] sm:px-5">
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
                    className="rounded-md border border-[#c5c5c5] bg-[#d4d4d4] px-2 py-1.5 text-[#262626] shadow-[inset_2px_2px_4px_#b8b8b8,inset_-2px_-2px_4px_#eeeeee]"
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
                    className="rounded p-1.5 hover:bg-[#d4d4d4] disabled:opacity-40"
                  >
                    <ChevronLeft aria-hidden="true" size={16} />
                  </button>
                  <span className="min-w-7 rounded bg-[#d4d4d4] px-2 py-1.5 text-center font-semibold text-[#171717] shadow-[inset_2px_2px_4px_#b8b8b8,inset_-2px_-2px_4px_#eeeeee]">
                    {currentPage}
                  </span>
                  <span className="px-1">of {totalPages}</span>
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    className="rounded p-1.5 hover:bg-[#d4d4d4] disabled:opacity-40"
                  >
                    <ChevronRight aria-hidden="true" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <p className="text-center text-xs text-[#a3a3a3]">
            Summary based on your orders, products, and customers.
          </p>
        </div>
      </main>
    </div>
  );
}
