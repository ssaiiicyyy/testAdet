"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageShell, CrudModal } from "@/components/admin-ui";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";

interface Transaction {
  transactions_id: number | string;
  transaction_code: string;
  order_id: number | string;
  payment_id: number | string;
}

interface Order {
  order_id: number | string;
}

interface Payment {
  payment_id: number | string;
  payment_method: string;
}

interface TransactionForm {
  transaction_code: string;
  order_id: string;
  payment_id: string;
}

const emptyForm: TransactionForm = {
  transaction_code: "",
  order_id: "",
  payment_id: "",
};

function isPositiveInteger(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

export default function TransactionsPage() {
  const { isChecking } = useAuthGuard();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (isChecking) return;
    let active = true;

    async function loadTransactions() {
      setLoading(true);
      setError("");
      try {
        const [transactionData, orderData, paymentData] = await Promise.all([
          apiClient<Transaction[]>("/transactions", { requiresAuth: true }),
          apiClient<Order[]>("/orders", { requiresAuth: true }),
          apiClient<Payment[]>("/payments", { requiresAuth: true }),
        ]);
        if (active) {
          setTransactions(transactionData);
          setOrders(orderData);
          setPayments(paymentData);
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load transactions.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTransactions();
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

    const transactionCode = form.transaction_code.trim();
    if (
      !transactionCode ||
      !isPositiveInteger(form.order_id) ||
      !isPositiveInteger(form.payment_id)
    ) {
      setError("Enter a transaction code and select a valid order and payment.");
      return;
    }

    const payload = {
      transaction_code: transactionCode,
      order_id: Number(form.order_id),
      payment_id: Number(form.payment_id),
    };

    setMutating(true);
    try {
      if (editingId === null) {
        const created = await apiClient<Transaction>("/transactions", {
          method: "POST",
          requiresAuth: true,
          body: JSON.stringify(payload),
        });
        setTransactions((current) => [created, ...current]);
        setSuccess("Transaction added successfully.");
      } else {
        await apiClient<Transaction>(`/transactions/${editingId}`, {
          method: "PUT",
          requiresAuth: true,
          body: JSON.stringify(payload),
        });
        setTransactions((current) =>
          current.map((transaction) =>
            Number(transaction.transactions_id) === editingId
              ? { ...transaction, ...payload }
              : transaction,
          ),
        );
        setSuccess("Transaction updated successfully.");
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save transaction.",
      );
    } finally {
      setMutating(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(Number(transaction.transactions_id));
    setForm({
      transaction_code: transaction.transaction_code,
      order_id: String(transaction.order_id),
      payment_id: String(transaction.payment_id),
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const handleDelete = async (transaction: Transaction) => {
    if (!window.confirm(`Delete transaction "${transaction.transaction_code}"?`)) {
      return;
    }

    setError("");
    setSuccess("");
    setMutating(true);
    try {
      const deleted = await apiClient<boolean>(
        `/transactions/${transaction.transactions_id}`,
        { method: "DELETE", requiresAuth: true },
      );
      if (!deleted) {
        setError("The transaction was not deleted; it may already be removed.");
        return;
      }
      setTransactions((current) =>
        current.filter(
          (item) => item.transactions_id !== transaction.transactions_id,
        ),
      );
      setSuccess("Transaction deleted successfully.");
    } catch (deleteError: unknown) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete transaction.",
      );
    } finally {
      setMutating(false);
    }
  };

  const visibleTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return transactions.filter((transaction) =>
      [
        transaction.transactions_id,
        transaction.transaction_code,
        transaction.order_id,
        transaction.payment_id,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [query, transactions]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff9ed]">
        <p className="text-sm text-[#8b7569]">Verifying session...</p>
      </div>
    );
  }

  return (
    <AdminPageShell
      activePage="Transactions"
      searchLabel="Search transactions"
      searchPlaceholder="Search transactions"
      query={query}
      onQueryChange={setQuery}
    >
      <section
        aria-labelledby="transactions-heading"
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c83f08]">
            Transactions
          </p>
          <h1
            id="transactions-heading"
            className="text-3xl font-bold uppercase leading-none tracking-tight text-[#171717] sm:text-4xl"
          >
            Manage Transactions
          </h1>
          <p className="mt-2 text-xs text-[#684c3d] sm:text-sm">
            View and manage payment transactions.
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
          Add Transaction
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
        aria-label="Transactions"
        className="overflow-x-auto rounded-2xl border border-[#f2e5d9] bg-white shadow-[0_6px_18px_rgba(115,70,30,0.1)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#f1e7df] px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ArrowLeftRight aria-hidden="true" size={16} />
            Transaction Records
          </h2>
          <span className="text-xs text-[#8b7569]">
            {visibleTransactions.length}{" "}
            {visibleTransactions.length === 1 ? "transaction" : "transactions"}
          </span>
        </div>
        <table className="w-full min-w-[620px] border-collapse text-left text-xs">
          <thead className="bg-[#fbf2e8] text-[#684c3d]">
            <tr>
              {["Transaction ID", "Transaction Code", "Order ID", "Payment ID", "Actions"].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1e7df]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[#8b7569]">
                  Loading transactions...
                </td>
              </tr>
            ) : visibleTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[#8b7569]">
                  {error
                    ? "Transaction data is unavailable."
                    : query
                      ? "No transactions match your search."
                      : "No transactions have been recorded."}
                </td>
              </tr>
            ) : (
              visibleTransactions.map((transaction) => (
                <tr
                  key={transaction.transactions_id}
                  className="transition-colors hover:bg-[#fffaf6]"
                >
                  <td className="px-4 py-3.5 font-semibold text-[#513a2e]">
                    {transaction.transactions_id}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[#513a2e]">
                    {transaction.transaction_code}
                  </td>
                  <td className="px-4 py-3.5 text-[#684c3d]">{transaction.order_id}</td>
                  <td className="px-4 py-3.5 text-[#684c3d]">{transaction.payment_id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(transaction)}
                        disabled={mutating}
                        aria-label={`Edit transaction ${transaction.transaction_code}`}
                        className="rounded-lg border border-[#e7d8cb] p-2 text-[#684c3d] transition-colors hover:bg-[#fff4e8] disabled:opacity-50"
                      >
                        <Pencil aria-hidden="true" size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(transaction)}
                        disabled={mutating}
                        aria-label={`Delete transaction ${transaction.transaction_code}`}
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
          title={editingId === null ? "Add Transaction" : `Edit Transaction #${editingId}`}
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
              Transaction Code
              <input
                required
                maxLength={255}
                autoFocus
                value={form.transaction_code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    transaction_code: event.target.value,
                  }))
                }
                placeholder="e.g. TXN-1001"
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
            <label className="block text-xs font-medium text-[#513a2e]">
              Payment
              <select
                required
                value={form.payment_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    payment_id: event.target.value,
                  }))
                }
                disabled={payments.length === 0 || mutating}
                className="mt-1.5 h-9 w-full rounded-md border border-[#d4d4d4] bg-white px-3 text-xs font-normal outline-none transition-colors focus:border-[#c83f08] focus:ring-2 focus:ring-[#ff6a00]/15 disabled:bg-[#f5f5f5]"
              >
                <option value="">Select Payment</option>
                {payments.map((payment) => (
                  <option key={payment.payment_id} value={payment.payment_id}>
                    Payment #{payment.payment_id} - {payment.payment_method}
                  </option>
                ))}
              </select>
            </label>
            {(orders.length === 0 || payments.length === 0) && !loading && (
              <div className="text-xs text-[#737373]">
                <p className="mb-1">
                  Create at least one order and payment before adding a transaction.
                </p>
                <a
                  href={orders.length === 0 ? "/orders" : "/payment"}
                  className="font-medium text-[#c83f08] underline underline-offset-2"
                >
                  {orders.length === 0 ? "Go to Orders" : "Go to Payments"}
                </a>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={
                  mutating || loading || orders.length === 0 || payments.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#ff6a00] to-[#c83f08] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-[#f45a00] hover:to-[#a93408] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutating
                  ? "Saving..."
                  : editingId === null
                    ? "Add Transaction"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </CrudModal>
      )}
    </AdminPageShell>
  );
}