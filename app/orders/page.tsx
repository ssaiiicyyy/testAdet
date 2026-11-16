"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { AdminPageShell, CrudModal } from "@/components/admin-ui";

interface Order {
  order_id: number | string;
  product_id: number | string;
  quantity: number | string;
  order_date?: string | null;
  order_status: string;
  total_amount: number | string;
  customer_id: number | string;
}

interface OrderForm {
  product_id: string;
  quantity: string;
  order_date: string;
  order_status: string;
  total_amount: string;
  customer_id: string;
}

const STATUS_OPTIONS = ["Pending", "Processing", "Completed", "Cancelled"];

const emptyForm: OrderForm = {
  product_id: "",
  quantity: "",
  order_date: "",
  order_status: "",
  total_amount: "",
  customer_id: "",
};

function isPositiveInteger(value: string) {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isInteger(parsed) && parsed > 0;
}

function isNonNegativeInteger(value: string) {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0;
}

function formatDate(value?: string | null) {
  return value ? String(value).slice(0, 10) : "";
}

const inputClass =
  "mt-1.5 h-9 w-full rounded-md border border-[#d4d4d4] px-3 text-xs font-normal outline-none transition-colors focus:border-[#c83f08] focus:ring-2 focus:ring-[#ff6a00]/15";

export default function OrdersPage() {
  const { isChecking } = useAuthGuard();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (isChecking) return;
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        const orderData = await apiClient<Order[]>("/orders", {
          requiresAuth: true,
        });
        if (active) setOrders(orderData);
      } catch (loadError: unknown) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load orders.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrders();
    return () => {
      active = false;
    };
  }, [isChecking]);

  const closeForm = useCallback(() => {
    if (mutating) return;
    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }, [mutating]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const orderStatus = form.order_status.trim();
    if (
      !isPositiveInteger(form.product_id) ||
      !isPositiveInteger(form.quantity) ||
      !isNonNegativeInteger(form.total_amount) ||
      !isPositiveInteger(form.customer_id) ||
      !orderStatus ||
      (editingId !== null && !form.order_date)
    ) {
      setError(
        "Enter a valid product, quantity, total amount, customer, and status.",
      );
      return;
    }

    const payload = {
      product_id: Number(form.product_id),
      quantity: Number(form.quantity),
      order_status: orderStatus,
      total_amount: Number(form.total_amount),
      customer_id: Number(form.customer_id),
    };

    setMutating(true);
    try {
      if (editingId === null) {
        // order_date is not part of the create contract; the backend sets it.
        const created = await apiClient<Order>("/orders", {
          method: "POST",
          requiresAuth: true,
          body: JSON.stringify(payload),
        });
        setOrders((current) => [created, ...current]);
        setSuccess("Order added successfully.");
      } else {
        const updatePayload = { ...payload, order_date: form.order_date };
        await apiClient<Order>(`/orders/${editingId}`, {
          method: "PUT",
          requiresAuth: true,
          body: JSON.stringify(updatePayload),
        });
        setOrders((current) =>
          current.map((order) =>
            Number(order.order_id) === editingId
              ? { ...order, ...updatePayload }
              : order,
          ),
        );
        setSuccess("Order updated successfully.");
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save order.",
      );
    } finally {
      setMutating(false);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingId(Number(order.order_id));
    setForm({
      product_id: String(order.product_id),
      quantity: String(order.quantity),
      order_date: formatDate(order.order_date),
      order_status: order.order_status,
      total_amount: String(order.total_amount),
      customer_id: String(order.customer_id),
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const handleDelete = async (order: Order) => {
    if (!window.confirm(`Delete order #${order.order_id}?`)) return;

    setError("");
    setSuccess("");
    setMutating(true);
    try {
      const deleted = await apiClient<boolean>(`/orders/${order.order_id}`, {
        method: "DELETE",
        requiresAuth: true,
      });
      if (!deleted) {
        setError("The order was not deleted; it may already be removed.");
        return;
      }
      setOrders((current) =>
        current.filter((item) => item.order_id !== order.order_id),
      );
      setSuccess("Order deleted successfully.");
    } catch (deleteError: unknown) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete order.",
      );
    } finally {
      setMutating(false);
    }
  };

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter((order) =>
      [
        order.order_id,
        order.product_id,
        order.quantity,
        order.order_date,
        order.order_status,
        order.total_amount,
        order.customer_id,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [orders, query]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff9ed]">
        <p className="text-sm text-[#8b7569]">Verifying session...</p>
      </div>
    );
  }

  return (
    <AdminPageShell
      activePage="Orders"
      searchLabel="Search orders"
      searchPlaceholder="Search orders"
      query={query}
      onQueryChange={setQuery}
    >
      <section
        aria-labelledby="orders-heading"
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c83f08]">
            Orders
          </p>
          <h1
            id="orders-heading"
            className="text-3xl font-bold uppercase leading-none tracking-tight text-[#171717] sm:text-4xl"
          >
            Manage Orders
          </h1>
          <p className="mt-2 text-xs text-[#684c3d] sm:text-sm">
            View and manage customer orders.
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
          Add Order
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
        aria-label="Orders"
        className="overflow-x-auto rounded-2xl border border-[#f2e5d9] bg-white shadow-[0_6px_18px_rgba(115,70,30,0.1)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#f1e7df] px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingCart aria-hidden="true" size={16} />
            Order Records
          </h2>
          <span className="text-xs text-[#8b7569]">
            {visibleOrders.length}{" "}
            {visibleOrders.length === 1 ? "order" : "orders"}
          </span>
        </div>
        <table className="w-full min-w-[860px] border-collapse text-left text-xs">
          <thead className="bg-[#fbf2e8] text-[#684c3d]">
            <tr>
              {[
                "Order ID",
                "Customer ID",
                "Product ID",
                "Quantity",
                "Total Amount",
                "Order Date",
                "Status",
                "Actions",
              ].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 font-semibold">
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
                  {error
                    ? "Order data is unavailable."
                    : query
                      ? "No orders match your search."
                      : "No orders have been recorded."}
                </td>
              </tr>
            ) : (
              visibleOrders.map((order) => (
                <tr
                  key={order.order_id}
                  className="transition-colors hover:bg-[#fffaf6]"
                >
                  <td className="px-4 py-3.5 font-semibold text-[#513a2e]">
                    {order.order_id}
                  </td>
                  <td className="px-4 py-3.5 text-[#684c3d]">
                    {order.customer_id}
                  </td>
                  <td className="px-4 py-3.5 text-[#684c3d]">
                    {order.product_id}
                  </td>
                  <td className="px-4 py-3.5 text-[#684c3d]">{order.quantity}</td>
                  <td className="px-4 py-3.5 font-medium text-[#513a2e]">
                    {order.total_amount}
                  </td>
                  <td className="px-4 py-3.5 text-[#684c3d]">
                    {formatDate(order.order_date)}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[#513a2e]">
                    {order.order_status}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(order)}
                        disabled={mutating}
                        aria-label={`Edit order ${order.order_id}`}
                        className="rounded-lg border border-[#e7d8cb] p-2 text-[#684c3d] transition-colors hover:bg-[#fff4e8] disabled:opacity-50"
                      >
                        <Pencil aria-hidden="true" size={15} />
                         </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(order)}
                        disabled={mutating}
                        aria-label={`Delete order ${order.order_id}`}
                        className="rounded-lg border border-red-200 p-2 text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
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
        <CrudModal
          title={editingId === null ? "Add Order" : `Edit Order #${editingId}`}
          onClose={closeForm}
          busy={mutating}
        >
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
              Customer ID
              <input
                required
                type="number"
                min={1}
                step={1}
                autoFocus
                value={form.customer_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customer_id: event.target.value,
                  }))
                }
                placeholder="e.g. 1"
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-medium text-[#513a2e]">
              Product ID
              <input
                required
                type="number"
                min={1}
                step={1}
                value={form.product_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    product_id: event.target.value,
                  }))
                }
                placeholder="e.g. 1"
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-medium text-[#513a2e]">
              Quantity
              <input
                required
                type="number"
                min={1}
                step={1}
                value={form.quantity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
                placeholder="e.g. 2"
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-medium text-[#513a2e]">
              Total Amount
              <input
                required
                type="number"
                min={0}
                step={1}
                value={form.total_amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    total_amount: event.target.value,
                  }))
                }
                placeholder="Whole number, e.g. 500"
                className={inputClass}
              />
            </label>
            {editingId !== null && (
              <label className="block text-xs font-medium text-[#513a2e]">
                Order Date
                <input
                  required
                  type="date"
                  value={form.order_date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      order_date: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>
            )}
            <label className="block text-xs font-medium text-[#513a2e]">
              Status
              <select
                required
                value={form.order_status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    order_status: event.target.value,
                  }))
                }
                disabled={mutating}
                className="mt-1.5 h-9 w-full rounded-md border border-[#d4d4d4] bg-white px-3 text-xs font-normal outline-none transition-colors focus:border-[#c83f08] focus:ring-2 focus:ring-[#ff6a00]/15 disabled:bg-[#f5f5f5]"
              >
                <option value="">Select Status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
                {form.order_status &&
                  !STATUS_OPTIONS.includes(form.order_status) && (
                    <option value={form.order_status}>
                      {form.order_status}
                    </option>
                  )}
              </select>
            </label>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={mutating || loading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#ff6a00] to-[#c83f08] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-[#f45a00] hover:to-[#a93408] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutating
                  ? "Saving..."
                  : editingId === null
                    ? "Add Order"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </CrudModal>
      )}
    </AdminPageShell>
  );
}