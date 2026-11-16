"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageShell, CrudModal } from "@/components/admin-ui";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";

interface Payment {
  payment_id: number | string;
  payment_method: string;
  order_id: number | string;
}

interface Order {
  order_id: number | string;
}

interface PaymentForm {
  payment_method: string;
  order_id: string;
}

const emptyForm: PaymentForm = {
  payment_method: "",
  order_id: "",
};

function isPositiveInteger(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

export default function PaymentsPage() {
  const { isChecking } = useAuthGuard();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<PaymentForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (isChecking) return;
    let active = true;

    async function loadPayments() {
      setLoading(true);
      setError("");
      try {
        const [paymentData, orderData] = await Promise.all([
          apiClient<Payment[]>("/payments", { requiresAuth: true }),
          apiClient<Order[]>("/orders", { requiresAuth: true }),
        ]);
        if (active) {
          setPayments(paymentData);
          setOrders(orderData);
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load payments.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPayments();
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

    const paymentMethod = form.payment_method.trim();
    if (!paymentMethod || !isPositiveInteger(form.order_id)) {
      setError("Enter a payment method and select a valid order.");
      return;
    }

    const payload = {
      payment_method: paymentMethod,
      order_id: Number(form.order_id),
    };

    setMutating(true);
    try {
      if (editingId === null) {
        const created = await apiClient<Payment>("/payments", {
          method: "POST",
          requiresAuth: true,
          body: JSON.stringify(payload),
        });
        setPayments((current) => [created, ...current]);
        setSuccess("Payment added successfully.");
      } else {
        await apiClient<Payment>(`/payments/${editingId}`, {
          method: "PUT",
          requiresAuth: true,
          body: JSON.stringify(payload),
        });
        setPayments((current) =>
          current.map((payment) =>
            Number(payment.payment_id) === editingId
              ? { ...payment, ...payload }
              : payment,
          ),
        );
        setSuccess("Payment updated successfully.");
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save payment.",
      );
    } finally {
      setMutating(false);
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingId(Number(payment.payment_id));
    setForm({
      payment_method: payment.payment_method,
      order_id: String(payment.order_id),
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const handleDelete = async (payment: Payment) => {
    if (!window.confirm(`Delete payment #${payment.payment_id}?`)) return;

    setError("");
    setSuccess("");
    setMutating(true);
    try {
      const deleted = await apiClient<boolean>(`/payments/${payment.payment_id}`, {
        method: "DELETE",
        requiresAuth: true,
      });
      if (!deleted) {
        setError("The payment was not deleted; it may already be removed.");
        return;
      }
      setPayments((current) =>
        current.filter((item) => item.payment_id !== payment.payment_id),
      );
      setSuccess("Payment deleted successfully.");
    } catch (deleteError: unknown) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete payment.",
      );
    } finally {
      setMutating(false);
    }
  };

  const visiblePayments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return payments.filter((payment) =>
      [payment.payment_id, payment.payment_method, payment.order_id].some(
        (value) => String(value ?? "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [payments, query]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff9ed]">
        <p className="text-sm text-[#8b7569]">Verifying session...</p>
      </div>
    );
  }

  return (
    <AdminPageShell
      activePage="Payments"
      searchLabel="Search payments"
      searchPlaceholder="Search payments"
      query={query}
      onQueryChange={setQuery}
    >
      <section
        aria-labelledby="payments-heading"
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c83f08]">
            Payments
          </p>
          <h1
            id="payments-heading"
            className="text-3xl font-bold uppercase leading-none tracking-tight text-[#171717] sm:text-4xl"
          >
            Manage Payments
          </h1>
          <p className="mt-2 text-xs text-[#684c3d] sm:text-sm">
            View and manage order payment methods.
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
          Add Payment
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
        aria-label="Payments"
        className="overflow-x-auto rounded-2xl border border-[#f2e5d9] bg-white shadow-[0_6px_18px_rgba(115,70,30,0.1)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#f1e7df] px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CreditCard aria-hidden="true" size={16} />
            Payment Records
          </h2>
          <span className="text-xs text-[#8b7569]">
            {visiblePayments.length}{" "}
            {visiblePayments.length === 1 ? "payment" : "payments"}
          </span>
        </div>
        <table className="w-full min-w-[520px] border-collapse text-left text-xs">
          <thead className="bg-[#fbf2e8] text-[#684c3d]">
            <tr>
              {["Payment ID", "Payment Method", "Order ID", "Actions"].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1e7df]">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-[#8b7569]">
                  Loading payments...
                </td>
              </tr>
            ) : visiblePayments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-[#8b7569]">
                  {error
                    ? "Payment data is unavailable."
                    : query
                      ? "No payments match your search."
                      : "No payments have been recorded."}
                </td>
              </tr>
            ) : (
              visiblePayments.map((payment) => (
                <tr
                  key={payment.payment_id}
                  className="transition-colors hover:bg-[#fffaf6]"
                >
                  <td className="px-4 py-3.5 font-semibold text-[#513a2e]">
                    {payment.payment_id}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[#513a2e]">
                    {payment.payment_method}
                  </td>
                  <td className="px-4 py-3.5 text-[#684c3d]">{payment.order_id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(payment)}
                        disabled={mutating}
                        aria-label={`Edit payment ${payment.payment_id}`}
                        className="rounded-lg border border-[#e7d8cb] p-2 text-[#684c3d] transition-colors hover:bg-[#fff4e8] disabled:opacity-50"
                      >
                        <Pencil aria-hidden="true" size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(payment)}
                        disabled={mutating}
                        aria-label={`Delete payment ${payment.payment_id}`}
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
          title={editingId === null ? "Add Payment" : `Edit Payment #${editingId}`}
          onClose={closeForm}
          busy={mutating}
        >
          {error && (
            <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs font-medium text-[#513a2e]">
              Payment Method
              <input
                required
                maxLength={255}
                autoFocus
                value={form.payment_method}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    payment_method: event.target.value,
                  }))
                }
                placeholder="e.g. Credit Card"
                className="mt-1.5 h-9 w-full rounded-md border border-[#d4d4d4] px-3 text-xs font-normal outline-none transition-colors focus:border-[#c83f08] focus:ring-2 focus:ring-[#ff6a00]/15"
              />
            </label>
            <label className="block text-xs font-medium text-[#513a2e]">
              Order
              <select
                required
                value={form.order_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    order_id: event.target.value,
                  }))
                }
                disabled={orders.length === 0 || mutating}
                className="mt-1.5 h-9 w-full rounded-md border border-[#d4d4d4] bg-white px-3 text-xs font-normal outline-none transition-colors focus:border-[#c83f08] focus:ring-2 focus:ring-[#ff6a00]/15 disabled:bg-[#f5f5f5]"
              >
                <option value="">Select Order</option>
                {orders.map((order) => (
                  <option key={order.order_id} value={order.order_id}>
                    Order #{order.order_id}
                  </option>
                ))}
              </select>
            </label>
            {orders.length === 0 && !loading && (
              <div className="text-xs text-[#737373]">
                <p className="mb-1">Create an order before adding a payment.</p>
                <a
                  href="/orders"
                  className="font-medium text-[#c83f08] underline underline-offset-2"
                >
                  Go to Orders
                </a>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={mutating || loading || orders.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#ff6a00] to-[#c83f08] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-[#f45a00] hover:to-[#a93408] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutating
                  ? "Saving..."
                  : editingId === null
                    ? "Add Payment"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </CrudModal>
      )}
    </AdminPageShell>
  );
}