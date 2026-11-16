"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageShell, CrudModal } from "@/components/admin-ui";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";

interface Manufacturer {
  manufacturers_id: number | string;
  manufacturers_name: string;
}

export default function ManufacturersPage() {
  const { isChecking } = useAuthGuard();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  const closeForm = useCallback(() => {
    if (mutating) return;
    setIsFormOpen(false);
    setEditingId(null);
    setName("");
    setError("");
  }, [mutating]);

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
      setIsFormOpen(false);
      setEditingId(null);
      setName("");
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

  const handleEdit = (manufacturer: Manufacturer) => {
    setEditingId(Number(manufacturer.manufacturers_id));
    setName(manufacturer.manufacturers_name);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
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
        setError("The manufacturer was not deleted; it may already be removed.");
        return;
      }
      setManufacturers((current) =>
        current.filter(
          (item) => item.manufacturers_id !== manufacturer.manufacturers_id,
        ),
      );
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

  const visibleManufacturers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return manufacturers.filter((manufacturer) =>
      [manufacturer.manufacturers_id, manufacturer.manufacturers_name].some(
        (value) => String(value ?? "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [manufacturers, query]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff9ed]">
        <p className="text-sm text-[#8b7569]">Verifying session...</p>
      </div>
    );
  }

  return (
    <AdminPageShell
      activePage="Manufacturers"
      searchLabel="Search manufacturers"
      searchPlaceholder="Search manufacturers"
      query={query}
      onQueryChange={setQuery}
    >
      <section
        aria-labelledby="manufacturers-heading"
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c83f08]">
            Manufacturers
          </p>
          <h1
            id="manufacturers-heading"
            className="text-3xl font-bold uppercase leading-none tracking-tight text-[#171717] sm:text-4xl"
          >
            Manage Manufacturers
          </h1>
          <p className="mt-2 text-xs text-[#684c3d] sm:text-sm">
            Manage the manufacturers linked to your products.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setName("");
            setError("");
            setSuccess("");
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#ff6a00] to-[#c83f08] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-[#f45a00] hover:to-[#a93408]"
        >
          <Plus aria-hidden="true" size={14} />
          Add Manufacturer
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
        aria-label="Manufacturers"
        className="overflow-x-auto rounded-2xl border border-[#f2e5d9] bg-white shadow-[0_6px_18px_rgba(115,70,30,0.1)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#f1e7df] px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Building2 aria-hidden="true" size={16} />
            Manufacturer Directory
          </h2>
          <span className="text-xs text-[#8b7569]">
            {visibleManufacturers.length}{" "}
            {visibleManufacturers.length === 1 ? "manufacturer" : "manufacturers"}
          </span>
        </div>
        <table className="w-full min-w-[480px] border-collapse text-left text-xs">
          <thead className="bg-[#fbf2e8] text-[#684c3d]">
            <tr>
              {["Manufacturer ID", "Manufacturer", "Actions"].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1e7df]">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-[#8b7569]">
                  Loading manufacturers...
                </td>
              </tr>
            ) : visibleManufacturers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-[#8b7569]">
                  {error
                    ? "Manufacturer data is unavailable."
                    : query
                      ? "No manufacturers match your search."
                      : "No manufacturers have been added."}
                </td>
              </tr>
            ) : (
              visibleManufacturers.map((manufacturer) => (
                <tr
                  key={manufacturer.manufacturers_id}
                  className="transition-colors hover:bg-[#fffaf6]"
                >
                  <td className="px-4 py-3.5 font-semibold text-[#513a2e]">
                    {manufacturer.manufacturers_id}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[#513a2e]">
                    {manufacturer.manufacturers_name}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(manufacturer)}
                        disabled={mutating}
                        aria-label={`Edit ${manufacturer.manufacturers_name}`}
                        className="rounded-lg border border-[#e7d8cb] p-2 text-[#684c3d] transition-colors hover:bg-[#fff4e8] disabled:opacity-50"
                      >
                        <Pencil aria-hidden="true" size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(manufacturer)}
                        disabled={mutating}
                        aria-label={`Delete ${manufacturer.manufacturers_name}`}
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
          title={editingId === null ? "Add Manufacturer" : `Edit Manufacturer #${editingId}`}
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
              Manufacturer Name
              <input
                required
                maxLength={255}
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={mutating}
                placeholder="e.g. Acme Supplies"
                className="mt-1.5 h-9 w-full rounded-md border border-[#d4d4d4] px-3 text-xs font-normal outline-none transition-colors focus:border-[#c83f08] focus:ring-2 focus:ring-[#ff6a00]/15 disabled:bg-[#f5f5f5]"
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
                    ? "Add Manufacturer"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </CrudModal>
      )}
    </AdminPageShell>
  );
}
