"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import shopLogo from "../../Orange_and_Black_Bold_Grunge_Digital_Marketing_Presentation__1_-removebg-preview.png";

interface Product {
  product_id: number | string;
  product_name: string;
  product_price: number | string;
  manufacturers_id: number | string;
}

interface Manufacturer {
  manufacturers_id: number | string;
  manufacturers_name: string;
}

interface ProductForm {
  product_name: string;
  product_price: string;
  manufacturers_id: string;
}

const emptyForm: ProductForm = {
  product_name: "",
  product_price: "",
  manufacturers_id: "",
};

const navigation: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: CONFIG.ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Products", href: "/products", icon: Package },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Payments", href: "/payment", icon: CreditCard },
  { label: "Manufacturers", href: "/manufacturers", icon: Building2 },
  {
    label: "Customers",
    href: `${CONFIG.ROUTES.DASHBOARD}#customers`,
    icon: UserRound,
  },
];

function formatAmount(value: number | string) {
  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function ProductsPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard();
  const [products, setProducts] = useState<Product[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mutating, setMutating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (isChecking) return;
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const [productData, manufacturerData] = await Promise.all([
          apiClient<Product[]>("/product", {
            method: "GET",
            requiresAuth: true,
          }),
          apiClient<Manufacturer[]>("/manufacturers", {
            method: "GET",
            requiresAuth: true,
          }),
        ]);
        if (active) {
          setProducts(productData);
          setManufacturers(manufacturerData);
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load products and manufacturers.",
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const productName = form.product_name.trim();
    const productPrice = Number(form.product_price);
    const manufacturerId = Number(form.manufacturers_id);
    if (
      !productName ||
      !Number.isFinite(productPrice) ||
      productPrice < 0 ||
      !Number.isInteger(manufacturerId) ||
      manufacturerId < 1
    ) {
      setError("Enter a product name, non-negative price, and valid manufacturer.");
      return;
    }

    const payload = {
      product_name: productName,
      product_price: productPrice,
      manufacturers_id: manufacturerId,
    };

    setMutating(true);
    try {
      if (editingId === null) {
        const created = await apiClient<Product>("/product", {
          method: "POST",
          requiresAuth: true,
          body: JSON.stringify(payload),
        });
        setProducts((current) => [created, ...current]);
        setSuccess("Product added successfully.");
      } else {
        await apiClient<Product>(`/product/${editingId}`, {
          method: "PUT",
          requiresAuth: true,
          body: JSON.stringify(payload),
        });
        setProducts((current) =>
          current.map((product) =>
            Number(product.product_id) === editingId
              ? { ...product, ...payload }
              : product,
          ),
        );
        setSuccess("Product updated successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setIsFormOpen(false);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save product.",
      );
    } finally {
      setMutating(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(Number(product.product_id));
    setForm({
      product_name: product.product_name,
      product_price: String(product.product_price),
      manufacturers_id: String(product.manufacturers_id),
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(false);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.product_name}"?`)) return;

    setError("");
    setSuccess("");
    setMutating(true);
    try {
      const deleted = await apiClient<boolean>(
        `/product/${product.product_id}`,
        { method: "DELETE", requiresAuth: true },
      );
      if (!deleted) {
        setError("The product was not deleted; it may already have been removed.");
        return;
      }

      setProducts((current) =>
        current.filter(
          (item) => item.product_id !== product.product_id,
        ),
      );
      if (editingId === Number(product.product_id)) handleCancelEdit();
      setSuccess("Product deleted successfully.");
    } catch (deleteError: unknown) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete product.",
      );
    } finally {
      setMutating(false);
    }
  };

  useEffect(() => {
    if (!isFormOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !mutating) {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setSuccess("");
        setIsFormOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFormOpen, mutating]);

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

  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const manufacturerName = manufacturers.find(
      (manufacturer) =>
        Number(manufacturer.manufacturers_id) ===
        Number(product.manufacturers_id),
    )?.manufacturers_name;
    return [
      product.product_id,
      product.product_name,
      product.product_price,
      product.manufacturers_id,
      manufacturerName,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(normalizedQuery),
    );
  });

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
            const active = label === "Products";
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
              aria-label="Search products"
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
          <section
            aria-labelledby="products-heading"
            className="flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c83f08]">
                Products
              </p>
              <h1
                id="products-heading"
                className="font-heading text-3xl font-bold uppercase leading-none tracking-tight text-[#171717] sm:text-4xl"
              >
                Manage Products
              </h1>
              <p className="mt-2 text-xs text-[#684c3d] sm:text-sm">
                Manage the products currently in the inventory.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setError("");
                setSuccess("");
                setIsFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#ff6a00] to-[#c83f08] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-[#f45a00] hover:to-[#a93408]"
            >
              <Plus aria-hidden="true" size={14} />
              Add Product
            </button>
          </section>

        {error && !isFormOpen && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
        {success && (
          <p
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </p>
        )}

        <section
          aria-label="Products"
          className="overflow-x-auto rounded-2xl border border-[#f2e5d9] bg-white shadow-[0_6px_18px_rgba(115,70,30,0.1)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#f1e7df] px-4 py-3">
            <h2 className="text-sm font-semibold">Product Inventory</h2>
            <span className="text-xs text-[#8b7569]">
              {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
            </span>
          </div>
          <table className="w-full min-w-[650px] border-collapse text-left text-xs">
            <thead className="bg-[#fbf2e8] text-[#684c3d]">
              <tr>
                {["Product ID", "Product", "Price", "Manufacturer", "Actions"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1e7df]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#737373]">
                    Loading products...
                  </td>
                </tr>
              ) : visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#737373]">
                    {error
                      ? "Product data is unavailable."
                      : query
                        ? "No products match your search."
                        : "No products have been added."}
                  </td>
                </tr>
              ) : (
                visibleProducts.map((product) => (
                  <tr key={product.product_id} className="transition-colors hover:bg-[#fffaf6]">
                    <td className="px-4 py-3.5 font-semibold text-[#513a2e]">
                      {product.product_id}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-[#513a2e]">
                      {product.product_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#684c3d]">
                      {formatAmount(product.product_price)}
                    </td>
                    <td className="px-4 py-3.5 text-[#684c3d]">
                      {manufacturers.find(
                        (manufacturer) =>
                          Number(manufacturer.manufacturers_id) ===
                          Number(product.manufacturers_id),
                      )?.manufacturers_name ?? product.manufacturers_id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          disabled={mutating}
                          aria-label={`Edit ${product.product_name}`}
                          className="rounded-lg border border-[#d4d4d4] p-2 text-[#525252] hover:bg-[#f5f5f5] disabled:opacity-50"
                        >
                          <Pencil aria-hidden="true" size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(product)}
                          disabled={mutating}
                          aria-label={`Delete ${product.product_name}`}
                          className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 aria-hidden="true" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close product dialog"
              onClick={handleCancelEdit}
              disabled={mutating}
              className="absolute inset-0 cursor-default bg-black/25 backdrop-blur-[1px] disabled:cursor-wait"
            />
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-dialog-title"
              className="relative z-10 w-full max-w-sm rounded-xl border border-[#f2e5d9] bg-white p-5 shadow-[0_16px_40px_rgba(43,29,22,0.2)] sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2
                  id="product-dialog-title"
                  className="text-base font-bold text-[#2b1d16]"
                >
                  {editingId === null ? "Add Product" : `Edit Product #${editingId}`}
                </h2>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={mutating}
                  aria-label="Close dialog"
                  className="rounded-md p-1.5 text-[#8b7569] transition-colors hover:bg-[#fff4e8] hover:text-[#2b1d16] disabled:opacity-50"
                >
                  <X aria-hidden="true" size={18} />
                </button>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700"
                >
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block text-xs font-medium text-[#513a2e]">
                  Product Name
                  <input
                    required
                    maxLength={255}
                    autoFocus
                    value={form.product_name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        product_name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Wireless Mouse"
                    className="mt-1.5 h-9 w-full rounded-md border border-[#d4d4d4] px-3 text-xs font-normal outline-none transition-colors focus:border-[#c83f08] focus:ring-2 focus:ring-[#ff6a00]/15"
                  />
                </label>

                <label className="block text-xs font-medium text-[#513a2e]">
                  Product Price
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.product_price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        product_price: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="mt-1.5 h-9 w-full rounded-md border border-[#d4d4d4] px-3 text-xs font-normal outline-none transition-colors focus:border-[#c83f08] focus:ring-2 focus:ring-[#ff6a00]/15"
                  />
                </label>

                <label className="block text-xs font-medium text-[#513a2e]">
                  Product Manufacturer
                  <select
                    required
                    value={form.manufacturers_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        manufacturers_id: event.target.value,
                      }))
                    }
                    disabled={manufacturers.length === 0 || mutating}
                    className="mt-1.5 h-9 w-full rounded-md border border-[#d4d4d4] bg-white px-3 text-xs font-normal outline-none transition-colors focus:border-[#c83f08] focus:ring-2 focus:ring-[#ff6a00]/15 disabled:bg-[#f5f5f5]"
                  >
                    <option value="">Select Manufacturer</option>
                    {manufacturers.map((manufacturer) => (
                      <option
                        key={manufacturer.manufacturers_id}
                        value={manufacturer.manufacturers_id}
                      >
                        {manufacturer.manufacturers_name}
                      </option>
                    ))}
                  </select>
                </label>

                {manufacturers.length === 0 && !loading && (
                  <div className="text-xs text-[#737373]">
                    <p className="mb-1">
                      Add a manufacturer before creating products.
                    </p>
                    <Link
                      href="/manufacturers"
                      className="font-medium text-[#c83f08] underline underline-offset-2"
                    >
                      Go to Manufacturers
                    </Link>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={mutating || loading || manufacturers.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#ff6a00] to-[#c83f08] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-[#f45a00] hover:to-[#a93408] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {editingId === null ? (
                      <Plus aria-hidden="true" size={14} />
                    ) : (
                      <Pencil aria-hidden="true" size={14} />
                    )}
                    {mutating
                      ? "Saving..."
                      : editingId === null
                        ? "Add Product"
                        : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}