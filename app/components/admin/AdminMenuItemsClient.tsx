"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import {
  createAdminMenuItem,
  deleteAdminMenuItem,
  updateAdminMenuItem,
  type AdminMenuCategoryOption,
  type AdminMenuItemData,
  type CreateAdminMenuItemInput,
} from "@/lib/client/adminMenuItems";

import AdminMenuItemForm from "./AdminMenuItemForm";

type AdminMenuItemsClientProps = {
  initialItems: AdminMenuItemData[];
  categories: AdminMenuCategoryOption[];
  canManage: boolean;
};

type AvailabilityFilter =
  | "ALL"
  | "AVAILABLE"
  | "UNAVAILABLE";

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function sortItems(
  items: AdminMenuItemData[],
): AdminMenuItemData[] {
  return [...items].sort((first, second) => {
    const categoryComparison =
      first.categoryName.localeCompare(
        second.categoryName,
      );

    if (categoryComparison !== 0) {
      return categoryComparison;
    }

    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return first.name.localeCompare(second.name);
  });
}

export default function AdminMenuItemsClient({
  initialItems,
  categories,
  canManage,
}: AdminMenuItemsClientProps) {
  const reduceMotion = useHydratedReducedMotion();

  const [items, setItems] = useState<
    AdminMenuItemData[]
  >(() => sortItems(initialItems));

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("ALL");

  const [formOpen, setFormOpen] = useState(false);

  const [editingItemId, setEditingItemId] = useState<
    string | null
  >(null);

  const [submittingForm, setSubmittingForm] =
    useState(false);

  const [busyItemId, setBusyItemId] = useState<
    string | null
  >(null);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [message, setMessage] = useState<string | null>(
    null,
  );

  const editingItem =
    items.find((item) => item.id === editingItemId) ??
    null;

  const availableItemCount = useMemo(() => {
    return items.filter((item) => item.available).length;
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        item.categoryName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "ALL" ||
        item.categoryId === categoryFilter;

      const matchesAvailability =
        availabilityFilter === "ALL" ||
        (availabilityFilter === "AVAILABLE"
          ? item.available
          : !item.available);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAvailability
      );
    });
  }, [
    items,
    search,
    categoryFilter,
    availabilityFilter,
  ]);

  const filtersActive =
    search.trim() !== "" ||
    categoryFilter !== "ALL" ||
    availabilityFilter !== "ALL";

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  function replaceItem(updatedItem: AdminMenuItemData) {
    setItems((currentItems) =>
      sortItems(
        currentItems.map((item) =>
          item.id === updatedItem.id
            ? updatedItem
            : item,
        ),
      ),
    );
  }

  function openCreateForm() {
    clearFeedback();
    setEditingItemId(null);
    setFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  function openEditForm(item: AdminMenuItemData) {
    clearFeedback();
    setEditingItemId(item.id);
    setFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  function closeForm() {
    if (submittingForm) {
      return;
    }

    setFormOpen(false);
    setEditingItemId(null);
  }

  function resetFilters() {
    setSearch("");
    setCategoryFilter("ALL");
    setAvailabilityFilter("ALL");
  }

  async function handleFormSubmit(
    input: CreateAdminMenuItemInput,
  ) {
    if (!canManage || submittingForm) {
      return;
    }

    clearFeedback();
    setSubmittingForm(true);

    try {
      if (editingItem) {
        const response = await updateAdminMenuItem(
          editingItem.id,
          input,
        );

        replaceItem(response.item);
        setMessage(response.message);
      } else {
        const response =
          await createAdminMenuItem(input);

        setItems((currentItems) =>
          sortItems([
            ...currentItems,
            response.item,
          ]),
        );

        setMessage(response.message);
      }

      setFormOpen(false);
      setEditingItemId(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save the menu item.",
      );
    } finally {
      setSubmittingForm(false);
    }
  }

  async function handleToggleAvailability(
    item: AdminMenuItemData,
  ) {
    if (!canManage || busyItemId) {
      return;
    }

    clearFeedback();
    setBusyItemId(item.id);

    try {
      const response = await updateAdminMenuItem(
        item.id,
        {
          available: !item.available,
        },
      );

      replaceItem(response.item);

      setMessage(
        response.item.available
          ? `"${response.item.name}" is now available.`
          : `"${response.item.name}" is now unavailable.`,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update availability.",
      );
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleToggleFeatured(
    item: AdminMenuItemData,
  ) {
    if (!canManage || busyItemId) {
      return;
    }

    clearFeedback();
    setBusyItemId(item.id);

    try {
      const response = await updateAdminMenuItem(
        item.id,
        {
          featured: !item.featured,
        },
      );

      replaceItem(response.item);

      setMessage(
        response.item.featured
          ? `"${response.item.name}" is now featured.`
          : `"${response.item.name}" is no longer featured.`,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update featured status.",
      );
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleDeleteItem(
    item: AdminMenuItemData,
  ) {
    if (!canManage || busyItemId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${item.name}" permanently?\n\nIf this item is connected to historical orders, deletion will be blocked.`,
    );

    if (!confirmed) {
      return;
    }

    clearFeedback();
    setBusyItemId(item.id);

    try {
      const response = await deleteAdminMenuItem(
        item.id,
      );

      setItems((currentItems) =>
        currentItems.filter(
          (currentItem) =>
            currentItem.id !== item.id,
        ),
      );

      if (editingItemId === item.id) {
        setFormOpen(false);
        setEditingItemId(null);
      }

      setMessage(response.message);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete the menu item.",
      );
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e7d8cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(93,48,21,0.08)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <UtensilsCrossed className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#2b160d]">
                Menu items
              </h2>

              <p className="mt-1 text-sm text-[#837268]">
                {items.length} total ·{" "}
                {availableItemCount} available
              </p>
            </div>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openCreateForm}
              disabled={submittingForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9c4517] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7d3511] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add menu item
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(220px,1fr)_200px_200px]">
          <label className="relative">
            <span className="sr-only">
              Search menu items
            </span>

            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b897d]" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search item or category..."
              className="w-full rounded-xl border border-[#dfcbbb] bg-white py-3 pl-11 pr-10 text-sm text-[#2b160d] outline-none transition placeholder:text-[#aa988c] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#9b897d] hover:bg-orange-50"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            aria-label="Filter by category"
            className="rounded-xl border border-[#dfcbbb] bg-white px-4 py-3 text-sm text-[#2b160d] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          >
            <option value="ALL">All categories</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(
                event.target
                  .value as AvailabilityFilter,
              )
            }
            aria-label="Filter availability"
            className="rounded-xl border border-[#dfcbbb] bg-white px-4 py-3 text-sm text-[#2b160d] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          >
            <option value="ALL">All availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">
              Unavailable
            </option>
          </select>
        </div>

        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#ad4c17]"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}

        {!canManage && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your role can view menu items but cannot modify
            them.
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {message && (
          <div className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <span>{message}</span>

            <button
              type="button"
              onClick={() => setMessage(null)}
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {formOpen && (
        <motion.section
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: -10,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-3xl border border-[#e2cdbd] bg-white/90 p-5 shadow-[0_16px_45px_rgba(93,48,21,0.10)] sm:p-6"
        >
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-[#2b160d]">
              {editingItem
                ? `Edit ${editingItem.name}`
                : "Create menu item"}
            </h2>

            <p className="mt-1 text-sm text-[#837268]">
              {editingItem
                ? "Update this item's menu information."
                : "Add a new item to the customer menu."}
            </p>
          </div>

          <AdminMenuItemForm
            key={editingItem?.id ?? "create-item"}
            categories={categories}
            initialItem={editingItem}
            submitting={submittingForm}
            onSubmit={handleFormSubmit}
            onCancel={closeForm}
          />
        </motion.section>
      )}

      {filteredItems.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-[#dbc5b3] bg-white/60 px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <UtensilsCrossed className="h-6 w-6" />
          </div>

          <h3 className="mt-4 font-bold text-[#2b160d]">
            No menu items found
          </h3>

          <p className="mt-2 text-sm text-[#837268]">
            {filtersActive
              ? "Try changing your search or filters."
              : "Create your first menu item."}
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item, index) => {
            const busy = busyItemId === item.id;

            return (
              <motion.article
                key={item.id}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 14,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: reduceMotion
                    ? 0
                    : index * 0.035,
                }}
                className="flex flex-col rounded-2xl border border-[#e7d8cc] bg-white/80 p-5 shadow-[0_10px_30px_rgba(93,48,21,0.07)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#bd5b22]">
                      {item.categoryName}
                    </p>

                    <h3 className="mt-1 truncate text-lg font-extrabold text-[#2b160d]">
                      {item.name}
                    </h3>
                  </div>

                  <p className="shrink-0 text-lg font-extrabold text-[#9c4517]">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <p className="mt-3 line-clamp-3 min-h-15 text-sm leading-6 text-[#837268]">
                  {item.description ||
                    "No description added."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold",
                      item.available
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    {item.available
                      ? "Available"
                      : "Unavailable"}
                  </span>

                  {item.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      <Sparkles className="h-3 w-3" />
                      Featured
                    </span>
                  )}
                </div>

                {canManage && (
                  <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#eee2d8] pt-4">
                    <button
                      type="button"
                      disabled={Boolean(busyItemId)}
                      onClick={() => openEditForm(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfcbbb] px-3 py-2 text-xs font-bold text-[#65422e] hover:bg-orange-50 disabled:opacity-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(busyItemId)}
                      onClick={() =>
                        void handleToggleAvailability(
                          item,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfcbbb] px-3 py-2 text-xs font-bold text-[#65422e] hover:bg-orange-50 disabled:opacity-50"
                    >
                      {busy ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      ) : item.available ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}

                      {item.available ? "Hide" : "Show"}
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(busyItemId)}
                      onClick={() =>
                        void handleToggleFeatured(item)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfcbbb] px-3 py-2 text-xs font-bold text-[#65422e] hover:bg-orange-50 disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {item.featured
                        ? "Unfeature"
                        : "Feature"}
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(busyItemId)}
                      onClick={() =>
                        void handleDeleteItem(item)
                      }
                      className="ml-auto inline-flex items-center rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.article>
            );
          })}
        </section>
      )}
    </div>
  );
}