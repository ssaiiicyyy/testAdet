"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

interface Manufacturer {
  manufacturers_id: number | string;
  manufacturers_name: string;
}

export default function ManufacturersPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isChecking) return;
    let active = true;

    async function loadManufacturers() {
      setLoading(true);
      setError("");
      try {
        const data = await apiClient<Manufacturer[]>("/manufacturers", {
          method: "GET",
          requiresAuth: true,
        });
        if (active) setManufacturers(data);
      } catch (loadError: unknown) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load manufacturers.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadManufacturers();
    return () => {
      active = false;
    };
  }, [isChecking]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const manufacturerName = name.trim();
    if (!manufacturerName) {
      setError("Enter a manufacturer name.");
      return;
    }

    setError("");
    setSuccess("");
    setMutating(true);
    try {
      if (editingId === null) {
        const created = await apiClient<Manufacturer>("/manufacturers", {
          method: "POST",
          requiresAuth: true,
          body: JSON.stringify({ manufacturers_name: manufacturerName }),
        });
        setManufacturers((current) => [created, ...current]);
        setSuccess("Manufacturer added successfully.");
      } else {
        await apiClient<Manufacturer>(`/manufacturers/${editingId}`, {
          method: "PUT",
          requiresAuth: true,
          body: JSON.stringify({ manufacturers_name: manufacturerName }),
        });
        setManufacturers((current) =>
          current.map((manufacturer) =>
            Number(manufacturer.manufacturers_id) === editingId
              ? { ...manufacturer, manufacturers_name: manufacturerName }
              : manufacturer,
          ),
        );
        setSuccess("Manufacturer updated successfully.");
      }
      setName("");
      setEditingId(null);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save manufacturer.",
      );
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (manufacturer: Manufacturer) => {
    if (!window.confirm(`Delete "${manufacturer.manufacturers_name}"?`)) return;

    setError("");
    setSuccess("");
    setMutating(true);
    try {
      const deleted = await apiClient<boolean>(
        `/manufacturers/${manufacturer.manufacturers_id}`,
        { method: "DELETE", requiresAuth: true },
      );
      if (!deleted) {
        setError(
          "The manufacturer was not deleted; it may already have been removed.",
        );
        return;
      }

      setManufacturers((current) =>
        current.filter(
          (item) =>
            item.manufacturers_id !== manufacturer.manufacturers_id,
        ),
      );
      if (editingId === Number(manufacturer.manufacturers_id)) {
        setEditingId(null);
        setName("");
      }
      setSuccess("Manufacturer deleted successfully.");
    } catch (deleteError: unknown) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete manufacturer.",
      );
    } finally {
      setMutating(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.replace(CONFIG.ROUTES.LOGIN);
    router.refresh();
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5e5e5]">
        <p className="text-sm text-[#737373]">Verifying session...</p>
      </div>
    );
  }

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
              <Building2 aria-hidden="true" size={26} />
              Manufacturers
            </h1>
            <p className="mt-1 text-sm text-[#737373]">
              Manage the manufacturers linked to your products.
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

        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-[#d4d4d4] bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {editingId === null
                ? "Add manufacturer"
                : `Edit manufacturer #${editingId}`}
            </h2>
            {editingId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName("");
                  setError("");
                  setSuccess("");
                }}
                disabled={mutating}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-[#525252] hover:bg-[#f5f5f5] disabled:opacity-50"
              >
                <X aria-hidden="true" size={16} />
                Cancel
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex-1 text-sm font-medium text-[#404040]">
              Manufacturer name
              <input
                required
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={mutating}
                className="mt-1 w-full rounded-lg border border-[#d4d4d4] px-3 py-2 font-normal outline-none focus:border-[#c83f08] disabled:bg-[#f5f5f5]"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={mutating || loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c83f08] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a93408] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {editingId === null ? (
                  <Plus aria-hidden="true" size={16} />
                ) : (
                  <Pencil aria-hidden="true" size={16} />
                )}
                {mutating
                  ? "Saving..."
                  : editingId === null
                    ? "Add manufacturer"
                    : "Save changes"}
              </button>
            </div>
          </div>
        </form>

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
        {success && (
          <p
            role="status"
            className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </p>
        )}

        <section
          aria-label="Manufacturers"
          className="overflow-x-auto rounded-2xl border border-[#d4d4d4] bg-white shadow-sm"
        >
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead className="bg-[#f5f5f5] text-[#525252]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Manufacturer ID
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Manufacturer
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeee]">
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-12 text-center text-[#737373]"
                  >
                    Loading manufacturers...
                  </td>
                </tr>
              ) : manufacturers.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-12 text-center text-[#737373]"
                  >
                    {error
                      ? "Manufacturer data is unavailable."
                      : "No manufacturers have been added."}
                  </td>
                </tr>
              ) : (
                manufacturers.map((manufacturer) => (
                  <tr
                    key={manufacturer.manufacturers_id}
                    className="hover:bg-[#fafafa]"
                  >
                    <td className="px-4 py-3 font-semibold">
                      {manufacturer.manufacturers_id}
                    </td>
                    <td className="px-4 py-3">
                      {manufacturer.manufacturers_name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => {
                            setEditingId(Number(manufacturer.manufacturers_id));
                            setName(manufacturer.manufacturers_name);
                            setError("");
                            setSuccess("");
                          }}
                          aria-label={`Edit ${manufacturer.manufacturers_name}`}
                          className="rounded-lg border border-[#d4d4d4] p-2 text-[#525252] hover:bg-[#f5f5f5] disabled:opacity-50"
                        >
                          <Pencil aria-hidden="true" size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => void handleDelete(manufacturer)}
                          aria-label={`Delete ${manufacturer.manufacturers_name}`}
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
      </div>
    </main>
  );
}