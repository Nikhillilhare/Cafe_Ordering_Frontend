"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  FolderPlus,
  LoaderCircle,
  Pencil,
  Save,
  Tags,
  Trash2,
  X,
} from "lucide-react";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import {
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory,
  type AdminCategoryData,
} from "@/lib/client/adminCategories";

type AdminCategoriesClientProps = {
  initialCategories: AdminCategoryData[];
  canManage: boolean;
};

function sortCategories(
  categories: AdminCategoryData[],
): AdminCategoryData[] {
  return [...categories].sort((first, second) => {
    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return first.name.localeCompare(second.name);
  });
}

export default function AdminCategoriesClient({
  initialCategories,
  canManage,
}: AdminCategoriesClientProps) {
  const reduceMotion = useHydratedReducedMotion();

  const [categories, setCategories] = useState<
    AdminCategoryData[]
  >(() => sortCategories(initialCategories));

  const [newCategoryName, setNewCategoryName] = useState("");

  const [editingCategoryId, setEditingCategoryId] = useState<
    string | null
  >(null);

  const [editingName, setEditingName] = useState("");

  const [creating, setCreating] = useState(false);

  const [busyCategoryId, setBusyCategoryId] = useState<
    string | null
  >(null);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const activeCategoryCount = useMemo(() => {
    return categories.filter((category) => category.active)
      .length;
  }, [categories]);

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  function replaceCategory(updatedCategory: AdminCategoryData) {
    setCategories((currentCategories) => {
      return sortCategories(
        currentCategories.map((category) => {
          if (category.id !== updatedCategory.id) {
            return category;
          }

          return updatedCategory;
        }),
      );
    });
  }

  async function handleCreateCategory(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (creating || !canManage) {
      return;
    }

    const normalizedName = newCategoryName
      .trim()
      .replace(/\s+/g, " ");

    if (normalizedName.length < 2) {
      setError(
        "Category name must contain at least 2 characters.",
      );
      return;
    }

    clearFeedback();
    setCreating(true);

    try {
      const response =
        await createAdminCategory(normalizedName);

      setCategories((currentCategories) =>
        sortCategories([
          ...currentCategories,
          response.category,
        ]),
      );

      setNewCategoryName("");
      setMessage(response.message);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create the category.",
      );
    } finally {
      setCreating(false);
    }
  }

  function startEditing(category: AdminCategoryData) {
    if (!canManage || busyCategoryId) {
      return;
    }

    clearFeedback();
    setEditingCategoryId(category.id);
    setEditingName(category.name);
  }

  function cancelEditing() {
    if (busyCategoryId) {
      return;
    }

    setEditingCategoryId(null);
    setEditingName("");
  }

  async function handleSaveName(categoryId: string) {
    if (!canManage || busyCategoryId) {
      return;
    }

    const normalizedName = editingName
      .trim()
      .replace(/\s+/g, " ");

    if (normalizedName.length < 2) {
      setError(
        "Category name must contain at least 2 characters.",
      );
      return;
    }

    clearFeedback();
    setBusyCategoryId(categoryId);

    try {
      const response = await updateAdminCategory(categoryId, {
        name: normalizedName,
      });

      replaceCategory(response.category);
      setEditingCategoryId(null);
      setEditingName("");
      setMessage(response.message);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to rename the category.",
      );
    } finally {
      setBusyCategoryId(null);
    }
  }

  async function handleToggleActive(
    category: AdminCategoryData,
  ) {
    if (!canManage || busyCategoryId) {
      return;
    }

    clearFeedback();
    setBusyCategoryId(category.id);

    try {
      const response = await updateAdminCategory(category.id, {
        active: !category.active,
      });

      replaceCategory(response.category);

      setMessage(
        response.category.active
          ? `"${response.category.name}" is now visible on the customer menu.`
          : `"${response.category.name}" is now hidden from the customer menu.`,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update category visibility.",
      );
    } finally {
      setBusyCategoryId(null);
    }
  }

  async function handleDeleteCategory(
    category: AdminCategoryData,
  ) {
    if (!canManage || busyCategoryId) {
      return;
    }

    if (category.itemCount > 0) {
      setError(
        `"${category.name}" contains ${category.itemCount} menu item${
          category.itemCount === 1 ? "" : "s"
        }. Move or delete those items first.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}" permanently? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    clearFeedback();
    setBusyCategoryId(category.id);

    try {
      const response = await deleteAdminCategory(category.id);

      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) =>
            currentCategory.id !== category.id,
        ),
      );

      if (editingCategoryId === category.id) {
        setEditingCategoryId(null);
        setEditingName("");
      }

      setMessage(response.message);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete the category.",
      );
    } finally {
      setBusyCategoryId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e7d8cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(93,48,21,0.08)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <Tags className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#2b160d]">
                Menu categories
              </h2>

              <p className="mt-1 text-sm text-[#837268]">
                {categories.length} total · {activeCategoryCount}{" "}
                active
              </p>
            </div>
          </div>

          {canManage && (
            <form
              onSubmit={handleCreateCategory}
              className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl"
            >
              <label className="flex-1">
                <span className="sr-only">
                  New category name
                </span>

                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(event) =>
                    setNewCategoryName(event.target.value)
                  }
                  maxLength={80}
                  disabled={creating}
                  placeholder="Example: Hot Coffee"
                  className="w-full rounded-xl border border-[#dfcbbb] bg-white px-4 py-3 text-sm text-[#2b160d] outline-none transition placeholder:text-[#aa988c] focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                />
              </label>

              <button
                type="submit"
                disabled={
                  creating ||
                  newCategoryName.trim().length < 2
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9c4517] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7d3511] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <FolderPlus className="h-4 w-4" />
                )}

                {creating ? "Creating…" : "Add category"}
              </button>
            </form>
          )}
        </div>

        {!canManage && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your role can view categories but cannot modify
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

      {categories.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-[#dbc5b3] bg-white/60 px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <Tags className="h-6 w-6" />
          </div>

          <h3 className="mt-4 font-bold text-[#2b160d]">
            No categories yet
          </h3>

          <p className="mt-2 text-sm text-[#837268]">
            Create your first menu category to organize menu
            items.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => {
            const busy = busyCategoryId === category.id;
            const editing =
              editingCategoryId === category.id;

            return (
              <motion.article
                key={category.id}
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
                  delay: reduceMotion ? 0 : index * 0.04,
                }}
                className="rounded-2xl border border-[#e7d8cc] bg-white/80 p-5 shadow-[0_10px_30px_rgba(93,48,21,0.07)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {editing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(event) =>
                          setEditingName(event.target.value)
                        }
                        maxLength={80}
                        autoFocus
                        disabled={busy}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleSaveName(category.id);
                          }

                          if (event.key === "Escape") {
                            cancelEditing();
                          }
                        }}
                        className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 font-bold text-[#2b160d] outline-none ring-4 ring-orange-100"
                      />
                    ) : (
                      <h3 className="truncate text-lg font-extrabold text-[#2b160d]">
                        {category.name}
                      </h3>
                    )}

                    <p className="mt-2 text-sm text-[#837268]">
                      {category.itemCount} menu{" "}
                      {category.itemCount === 1
                        ? "item"
                        : "items"}
                    </p>
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold",
                      category.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    {category.active ? "Active" : "Hidden"}
                  </span>
                </div>

                {canManage && (
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#eee2d8] pt-4">
                    {editing ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void handleSaveName(category.id)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#9c4517] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          {busy ? (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}

                          Save
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={cancelEditing}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfcbbb] px-3 py-2 text-xs font-bold text-[#65422e]"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={Boolean(busyCategoryId)}
                          onClick={() =>
                            startEditing(category)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfcbbb] px-3 py-2 text-xs font-bold text-[#65422e] transition hover:bg-orange-50 disabled:opacity-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Rename
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(busyCategoryId)}
                          onClick={() =>
                            void handleToggleActive(category)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfcbbb] px-3 py-2 text-xs font-bold text-[#65422e] transition hover:bg-orange-50 disabled:opacity-50"
                        >
                          {busy ? (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          ) : category.active ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}

                          {category.active ? "Hide" : "Show"}
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(busyCategoryId)}
                          onClick={() =>
                            void handleDeleteCategory(category)
                          }
                          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </>
                    )}
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