"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { AdminPageShell, CrudModal } from "@/components/admin-ui";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";

// NOTE: adjust these fields to match your backend's Customer schema.
interface Customer {
  customer_id: number | string;
  customer_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

interface CustomerForm {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
}

const emptyForm: CustomerForm = {
  customer_name: "",
  email: "",
  phone: "",
  address: "",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const inputClass =
  "mt-1.5 h-9 w-full rounded-md border border-[#d4d4d4] px-3 text-xs font-normal outline-none transition-colors focus:border-[#c83f08] focus:ring-2 focus:ring-[#ff6a00]/15";

export default function CustomersPage() {
  const { isChecking } = useAuthGuard();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (isChecking) return;
    let active = true;

    async function loadCustomers() {
      setLoading(true);
      setError("");
      try {
        const data = await apiClient<Customer[]>("/customers", {
          requiresAuth: true,
        });
        if (active) setCustomers(data);
      } catch (loadError: unknown) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load customers.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCustomers();
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

    const name = form.customer_name.trim();
    const email = form.email.trim();
    if (!name || !isValidEmail(email)) {
      setError("Enter a customer name and a valid email address.");
      return;
    }

    const payload = {
      customer_name: name,
      email,
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    setMutating(true);
    try {
      if (editingId === null) {
        const created = await apiClient<Customer>("/customers", {
          method: "POST",
          requiresAuth: true,
          body: JSON.stringify(payload),
        });
        setCustomers((current) => [created, ...current]);
        setSuccess("Customer added successfully.");
      } else {
        await apiClient<Customer>(`/customers/${editingId}`, {
          method: "PUT",
          requiresAuth: true,
          body: JSON.stringify(payload),
        });
        setCustomers((current) =>
          current.map((customer) =>
            Number(customer.customer_id) === editingId
              ? { ...customer, ...payload }
              : customer,
          ),
        );
        setSuccess("Customer updated successfully.");
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save customer.",
      );
    } finally {
      setMutating(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(Number(customer.customer_id));
    setForm({
      customer_name: customer.customer_name,
      email: customer.email,
      phone: customer.phone ?? "",
      address: customer.address ?? "",
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (
      !window.confirm(
        `Delete customer #${customer.customer_id} (${customer.customer_name})?`,
      )
    )
      return;

    setError("");
    setSuccess("");
    setMutating(true);
    try {
      const deleted = await apiClient<boolean>(
        `/customers/${customer.customer_id}`,
        {
          method: "DELETE",
          requiresAuth: true,
        },
      );
      if (!deleted) {
        setError("The customer was not deleted; it may already be removed.");
        return;
      }
      setCustomers((current) =>
        current.filter((item) => item.customer_id !== customer.customer_id),
      );
      setSuccess("Customer deleted successfully.");
    } catch (deleteError: unknown) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete customer.",
      );
    } finally {
      setMutating(false);
    }
  };
const visibleCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return customers.filter((customer) =>
      [
        customer.customer_id,
        customer.customer_name,
        customer.email,
        customer.phone,
        customer.address,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [customers, query]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff9ed]">
        <p className="text-sm text-[#8b7569]">Verifying session...</p>
      </div>
    );
  }

  return (
    <AdminPageShell
      activePage="Customers"
      searchLabel="Search customers"
      searchPlaceholder="Search customers"
      query={query}
      onQueryChange={setQuery}
    >
      <section
        aria-labelledby="customers-heading"
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c83f08]">
            Customers
          </p>
          <h1
            id="customers-heading"
            className="text-3xl font-bold uppercase leading-none tracking-tight text-[#171717] sm:text-4xl"
          >
            Manage Customers
          </h1>
          <p className="mt-2 text-xs text-[#684c3d] sm:text-sm">
            View and manage customer accounts.
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
          Add Customer
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
        aria-label="Customers"
        className="overflow-x-auto rounded-2xl border border-[#f2e5d9] bg-white shadow-[0_6px_18px_rgba(115,70,30,0.1)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#f1e7df] px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Users aria-hidden="true" size={16} />
            Customer Records
          </h2>
          <span className="text-xs text-[#8b7569]">
            {visibleCustomers.length}{" "}
            {visibleCustomers.length === 1 ? "customer" : "customers"}
          </span>
        </div>
        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
          <thead className="bg-[#fbf2e8] text-[#684c3d]">
            <tr>
              {[
                "Customer ID",
                "Name",
                "Email",
                "Phone",
                "Address",
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
                <td colSpan={6} className="px-4 py-12 text-center text-[#8b7569]">
                  Loading customers...
                </td>
              </tr>
            ) : visibleCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#8b7569]">
                  {error
                    ? "Customer data is unavailable."
                    : query
                      ? "No customers match your search."
                      : "No customers have been recorded."}
                </td>
              </tr>
            ) : (
              visibleCustomers.map((customer) => (
                <tr
                  key={customer.customer_id}
                  className="transition-colors hover:bg-[#fffaf6]"
                >
                  <td className="px-4 py-3.5 font-semibold text-[#513a2e]">
                    {customer.customer_id}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[#513a2e]">
                    {customer.customer_name}
                  </td>
                  <td className="px-4 py-3.5 text-[#684c3d]">
                    {customer.email}
                  </td>
                  <td className="px-4 py-3.5 text-[#684c3d]">
                    {customer.phone}
                  </td>
                  <td className="px-4 py-3.5 text-[#684c3d]">
                    {customer.address}
                  </td>
                    <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(customer)}
                        disabled={mutating}
                        aria-label={`Edit customer ${customer.customer_id}`}
                        className="rounded-lg border border-[#e7d8cb] p-2 text-[#684c3d] transition-colors hover:bg-[#fff4e8] disabled:opacity-50"
                      >
                        <Pencil aria-hidden="true" size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(customer)}
                        disabled={mutating}
                        aria-label={`Delete customer ${customer.customer_id}`}
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
          title={
            editingId === null ? "Add Customer" : `Edit Customer #${editingId}`
          }
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
              Name
              <input
                required
                maxLength={255}
                autoFocus
                value={form.customer_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customer_name: event.target.value,
                  }))
                }
                placeholder="e.g. Juan Dela Cruz"
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-medium text-[#513a2e]">
              Email
              <input
                required
                type="email"
                maxLength={255}
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="e.g. juan@example.com"
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-medium text-[#513a2e]">
              Phone
              <input
                type="tel"
                maxLength={50}
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="e.g. 0917 123 4567"
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-medium text-[#513a2e]">
              Address
              <input
                maxLength={255}
                value={form.address}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                placeholder="e.g. Quezon City, Metro Manila"
                className={inputClass}
              />
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
                    ? "Add Customer"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </CrudModal>
      )}
    </AdminPageShell>
  );
}