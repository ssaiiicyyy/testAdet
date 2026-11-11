"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Package } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

interface Product {
  product_id: number | string;
  product_name: string;
  product_price: number | string;
  manufacturers_id: number | string;
}

function formatAmount(value: number | string) {
  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function ProductsPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isChecking) return;
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const data = await apiClient<Product[]>("/product", {
          requiresAuth: true,
        });
        if (active) setProducts(data);
      } catch (loadError: unknown) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load products.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, [isChecking]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5e5e5]">
        <p className="text-sm text-[#737373]">Verifying session...</p>
      </div>
    );
  }

  const handleLogout = () => {
    clearTokens();
    router.replace(CONFIG.ROUTES.LOGIN);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#e5e5e5] px-4 py-6 text-[#171717] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href={CONFIG.ROUTES.DASHBOARD}
              className="mb-3 inline-flex items-center gap-2 text-sm text-[#525252] hover:text-[#171717]"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Dashboard
            </Link>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Package aria-hidden="true" size={26} />
              Products
            </h1>
            <p className="mt-1 text-sm text-[#737373]">
              Browse products currently in inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#262626]"
          >
            <LogOut aria-hidden="true" size={16} />
            Log out
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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

        <section
          aria-label="Products"
          className="overflow-x-auto rounded-2xl border border-[#d4d4d4] bg-white shadow-sm"
        >
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead className="bg-[#f5f5f5] text-[#525252]">
              <tr>
                {["Product ID", "Product", "Price", "Manufacturer ID"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeee]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[#737373]">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[#737373]">
                    {error ? "Product data is unavailable." : "No products have been added."}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.product_id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 font-semibold">{product.product_id}</td>
                    <td className="px-4 py-3">{product.product_name}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatAmount(product.product_price)}
                    </td>
                    <td className="px-4 py-3">{product.manufacturers_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}