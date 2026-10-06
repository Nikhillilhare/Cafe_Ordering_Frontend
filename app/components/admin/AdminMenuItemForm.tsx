"use client";

import {
  type FormEvent,
  useState,
} from "react";
import {
  Check,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";

import type {
  AdminMenuCategoryOption,
  AdminMenuItemData,
  CreateAdminMenuItemInput,
} from "@/lib/client/adminMenuItems";

type AdminMenuItemFormProps = {
  categories: AdminMenuCategoryOption[];
  initialItem?: AdminMenuItemData | null;
  submitting: boolean;

  onSubmit: (
    input: CreateAdminMenuItemInput,
  ) => void | Promise<void>;

  onCancel: () => void;
};

export default function AdminMenuItemForm({
  categories,
  initialItem = null,
  submitting,
  onSubmit,
  onCancel,
}: AdminMenuItemFormProps) {
  const [categoryId, setCategoryId] = useState(
    initialItem?.categoryId ?? categories[0]?.id ?? "",
  );

  const [name, setName] = useState(
    initialItem?.name ?? "",
  );

  const [description, setDescription] = useState(
    initialItem?.description ?? "",
  );

  const [price, setPrice] = useState(
    initialItem ? String(initialItem.price) : "",
  );

  const [available, setAvailable] = useState(
    initialItem?.available ?? true,
  );

  const [featured, setFeatured] = useState(
    initialItem?.featured ?? false,
  );

  const [validationError, setValidationError] = useState<
    string | null
  >(null);

  const editing = initialItem !== null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const normalizedName = name
      .trim()
      .replace(/\s+/g, " ");

    const normalizedDescription = description
      .trim()
      .replace(/\s+/g, " ");

    const numericPrice = Number(price);

    if (!categoryId) {
      setValidationError("Please select a category.");
      return;
    }

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 100
    ) {
      setValidationError(
        "Item name must be between 2 and 100 characters.",
      );
      return;
    }

    if (normalizedDescription.length > 500) {
      setValidationError(
        "Description cannot contain more than 500 characters.",
      );
      return;
    }

    if (
      !Number.isInteger(numericPrice) ||
      numericPrice < 1 ||
      numericPrice > 1000000
    ) {
      setValidationError(
        "Price must be a whole number between ₹1 and ₹10,00,000.",
      );
      return;
    }

    setValidationError(null);

    void onSubmit({
      categoryId,
      name: normalizedName,
      description: normalizedDescription,
      price: numericPrice,
      available,
      featured,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {validationError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {validationError}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          Create at least one category before adding a menu
          item.
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#4d2a18]">
                Item name
              </span>

              <input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setValidationError(null);
                }}
                maxLength={100}
                disabled={submitting}
                placeholder="Example: Cappuccino"
                className="w-full rounded-xl border border-[#dfcbbb] bg-white px-4 py-3 text-sm text-[#2b160d] outline-none transition placeholder:text-[#aa988c] focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#4d2a18]">
                Category
              </span>

              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setValidationError(null);
                }}
                disabled={submitting}
                className="w-full rounded-xl border border-[#dfcbbb] bg-white px-4 py-3 text-sm text-[#2b160d] outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                    {category.active ? "" : " (Hidden)"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-[#4d2a18]">
                Description
              </span>

              <span className="text-xs text-[#9b897d]">
                {description.length}/500
              </span>
            </div>

            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setValidationError(null);
              }}
              maxLength={500}
              rows={4}
              disabled={submitting}
              placeholder="Briefly describe the item..."
              className="w-full resize-none rounded-xl border border-[#dfcbbb] bg-white px-4 py-3 text-sm leading-6 text-[#2b160d] outline-none transition placeholder:text-[#aa988c] focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#4d2a18]">
              Price in rupees
            </span>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#78543f]">
                ₹
              </span>

              <input
                type="number"
                value={price}
                onChange={(event) => {
                  setPrice(event.target.value);
                  setValidationError(null);
                }}
                min={1}
                max={1000000}
                step={1}
                inputMode="numeric"
                disabled={submitting}
                placeholder="150"
                className="w-full rounded-xl border border-[#dfcbbb] bg-white py-3 pl-9 pr-4 text-sm text-[#2b160d] outline-none transition placeholder:text-[#aa988c] focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
              />
            </div>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e5d5c8] bg-orange-50/50 p-4">
              <input
                type="checkbox"
                checked={available}
                onChange={(event) =>
                  setAvailable(event.target.checked)
                }
                disabled={submitting}
                className="mt-0.5 h-4 w-4 accent-[#9c4517]"
              />

              <span>
                <span className="block text-sm font-bold text-[#3e2113]">
                  Available
                </span>

                <span className="mt-1 block text-xs leading-5 text-[#89776c]">
                  Customers can view and order this item.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e5d5c8] bg-orange-50/50 p-4">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) =>
                  setFeatured(event.target.checked)
                }
                disabled={submitting}
                className="mt-0.5 h-4 w-4 accent-[#9c4517]"
              />

              <span>
                <span className="block text-sm font-bold text-[#3e2113]">
                  Featured item
                </span>

                <span className="mt-1 block text-xs leading-5 text-[#89776c]">
                  Highlight this item on the customer menu.
                </span>
              </span>
            </label>
          </div>
        </>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-[#eee1d7] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfcbbb] bg-white px-5 py-3 text-sm font-bold text-[#65422e] transition hover:bg-orange-50 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            submitting ||
            categories.length === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9c4517] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7d3511] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {editing ? "Saving…" : "Creating…"}
            </>
          ) : editing ? (
            <>
              <Save className="h-4 w-4" />
              Save changes
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Create item
            </>
          )}
        </button>
      </div>
    </form>
  );
}