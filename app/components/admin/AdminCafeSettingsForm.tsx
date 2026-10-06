"use client";

import {
  type FormEvent,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  Palette,
  RotateCcw,
  Save,
  Store,
  X,
} from "lucide-react";

import {
  updateAdminCafeSettings,
  type AdminCafeSettingsData,
  type AdminThemeConfig,
} from "@/lib/client/adminSettings";

type AdminCafeSettingsFormProps = {
  initialSettings: AdminCafeSettingsData;
  canManage: boolean;
};

type ThemeField = {
  key: keyof AdminThemeConfig;
  label: string;
  description: string;
};

const themeFields: ThemeField[] = [
  {
    key: "primaryColor",
    label: "Primary color",
    description: "Buttons, prices and active controls",
  },
  {
    key: "backgroundColor",
    label: "Background color",
    description: "Customer menu page background",
  },
  {
    key: "surfaceColor",
    label: "Surface color",
    description: "Menu cards, cart and form surfaces",
  },
  {
    key: "textColor",
    label: "Text color",
    description: "Main headings and body text",
  },
  {
    key: "mutedColor",
    label: "Muted color",
    description: "Descriptions and secondary information",
  },
  {
    key: "accentColor",
    label: "Accent color",
    description: "Badges and highlighted details",
  },
  {
    key: "successColor",
    label: "Success color",
    description: "Success and availability indicators",
  },
];

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export default function AdminCafeSettingsForm({
  initialSettings,
  canManage,
}: AdminCafeSettingsFormProps) {
  const router = useRouter();

  const [savedSettings, setSavedSettings] =
    useState(initialSettings);

  const [name, setName] = useState(
    initialSettings.name,
  );

  const [description, setDescription] = useState(
    initialSettings.description ?? "",
  );

  const [whatsappNumber, setWhatsappNumber] =
    useState(initialSettings.whatsappNumber);

  const [themeConfig, setThemeConfig] =
    useState<AdminThemeConfig>(
      initialSettings.themeConfig,
    );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [message, setMessage] = useState<string | null>(
    null,
  );

  function updateThemeColor(
    key: keyof AdminThemeConfig,
    value: string,
  ) {
    setThemeConfig((currentTheme) => ({
      ...currentTheme,
      [key]: value,
    }));

    setError(null);
    setMessage(null);
  }

  function resetForm() {
    if (saving) {
      return;
    }

    setName(savedSettings.name);
    setDescription(
      savedSettings.description ?? "",
    );
    setWhatsappNumber(
      savedSettings.whatsappNumber,
    );
    setThemeConfig(savedSettings.themeConfig);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canManage || saving) {
      return;
    }

    const normalizedName = name
      .trim()
      .replace(/\s+/g, " ");

    const normalizedDescription = description
      .trim()
      .replace(/\s+/g, " ");

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 100
    ) {
      setError(
        "Cafe name must be between 2 and 100 characters.",
      );
      return;
    }

    if (normalizedDescription.length > 500) {
      setError(
        "Description cannot contain more than 500 characters.",
      );
      return;
    }

    const invalidThemeField = themeFields.find(
      (field) =>
        !isHexColor(themeConfig[field.key]),
    );

    if (invalidThemeField) {
      setError(
        `${invalidThemeField.label} must be a valid six-digit hex color.`,
      );
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response =
        await updateAdminCafeSettings({
          name: normalizedName,
          description: normalizedDescription,
          whatsappNumber:
            whatsappNumber.trim(),
          themeConfig,
        });

      setSavedSettings(response.cafe);
      setName(response.cafe.name);
      setDescription(
        response.cafe.description ?? "",
      );
      setWhatsappNumber(
        response.cafe.whatsappNumber,
      );
      setThemeConfig(
        response.cafe.themeConfig,
      );

      setMessage(response.message);

      /*
       * Refresh Server Components so sidebar and header
       * immediately receive the updated cafe name.
       */
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update cafe settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {!canManage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your role can view cafe settings but cannot modify
          them.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
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
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
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

      <section className="rounded-3xl border border-[#e7d8cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(93,48,21,0.08)] backdrop-blur-xl sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <Store className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#2b160d]">
              Cafe information
            </h2>

            <p className="mt-1 text-sm text-[#837268]">
              Update the information displayed to customers.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#4d2a18]">
              Cafe name
            </span>

            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              maxLength={100}
              disabled={!canManage || saving}
              className="w-full rounded-xl border border-[#dfcbbb] bg-white px-4 py-3 text-sm text-[#2b160d] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#4d2a18]">
              Public cafe URL
            </span>

            <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[#dfcbbb] bg-[#f8f2ed] px-4 py-3">
              <span className="truncate text-sm text-[#765b4b]">
                /cafe/{initialSettings.slug}
              </span>

              <Link
                href={`/cafe/${initialSettings.slug}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-[#9c4517]"
                aria-label="Open public cafe"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-2 text-xs text-[#978579]">
              The slug is protected because changing it can
              break QR codes and saved links.
            </p>
          </label>
        </div>

        <label className="mt-5 block">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-[#4d2a18]">
              Description
            </span>

            <span className="text-xs text-[#978579]">
              {description.length}/500
            </span>
          </div>

          <textarea
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setError(null);
            }}
            maxLength={500}
            rows={4}
            disabled={!canManage || saving}
            className="w-full resize-none rounded-xl border border-[#dfcbbb] bg-white px-4 py-3 text-sm leading-6 text-[#2b160d] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
          />
        </label>
      </section>

      <section className="rounded-3xl border border-[#e7d8cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(93,48,21,0.08)] backdrop-blur-xl sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <MessageCircle className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#2b160d]">
              WhatsApp ordering
            </h2>

            <p className="mt-1 text-sm text-[#837268]">
              Customer order messages will open for this cafe
              number.
            </p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-[#4d2a18]">
            WhatsApp number
          </span>

          <input
            type="tel"
            value={whatsappNumber}
            onChange={(event) => {
              setWhatsappNumber(event.target.value);
              setError(null);
            }}
            disabled={!canManage || saving}
            placeholder="+919168561804"
            className="w-full rounded-xl border border-[#dfcbbb] bg-white px-4 py-3 text-sm text-[#2b160d] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
          />

          <p className="mt-2 text-xs text-[#978579]">
            Include the country code. Indian local numbers are
            automatically converted to +91 format.
          </p>
        </label>
      </section>

      <section className="rounded-3xl border border-[#e7d8cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(93,48,21,0.08)] backdrop-blur-xl sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <Palette className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#2b160d]">
              Customer-menu theme
            </h2>

            <p className="mt-1 text-sm text-[#837268]">
              These runtime colors are stored per cafe.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {themeFields.map((field) => {
            const value = themeConfig[field.key];

            return (
              <label
                key={field.key}
                className="rounded-2xl border border-[#e5d5c8] bg-orange-50/40 p-4"
              >
                <span className="text-sm font-bold text-[#4d2a18]">
                  {field.label}
                </span>

                <span className="mt-1 block text-xs leading-5 text-[#8b796d]">
                  {field.description}
                </span>

                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="color"
                    value={
                      isHexColor(value)
                        ? value
                        : "#000000"
                    }
                    onChange={(event) =>
                      updateThemeColor(
                        field.key,
                        event.target.value.toUpperCase(),
                      )
                    }
                    disabled={!canManage || saving}
                    className="h-11 w-14 cursor-pointer rounded-lg border border-[#dfcbbb] bg-white p-1 disabled:cursor-not-allowed"
                  />

                  <input
                    type="text"
                    value={value}
                    onChange={(event) =>
                      updateThemeColor(
                        field.key,
                        event.target.value.toUpperCase(),
                      )
                    }
                    maxLength={7}
                    disabled={!canManage || saving}
                    className="min-w-0 flex-1 rounded-lg border border-[#dfcbbb] bg-white px-3 py-2.5 font-mono text-sm uppercase text-[#2b160d] outline-none focus:border-orange-400 disabled:opacity-60"
                  />
                </div>
              </label>
            );
          })}
        </div>

        <div
          className="mt-6 overflow-hidden rounded-2xl border border-black/10 p-5"
          style={{
            backgroundColor:
              themeConfig.backgroundColor,
            color: themeConfig.textColor,
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{
              color: themeConfig.primaryColor,
            }}
          >
            Live theme preview
          </p>

          <div
            className="mt-3 rounded-xl p-4"
            style={{
              backgroundColor:
                themeConfig.surfaceColor,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold">Cappuccino</p>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: themeConfig.mutedColor,
                  }}
                >
                  Espresso, steamed milk and foam.
                </p>
              </div>

              <p
                className="font-bold"
                style={{
                  color: themeConfig.primaryColor,
                }}
              >
                ₹140
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor:
                    themeConfig.accentColor,
                }}
              >
                Featured
              </span>

              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{
                  backgroundColor:
                    themeConfig.successColor,
                }}
              >
                Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {canManage && (
        <div className="sticky bottom-4 z-20 flex flex-col-reverse gap-3 rounded-2xl border border-[#e2cdbd] bg-white/90 p-4 shadow-[0_18px_45px_rgba(63,29,12,0.18)] backdrop-blur-xl sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfcbbb] px-5 py-3 text-sm font-bold text-[#65422e] hover:bg-orange-50 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset changes
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9c4517] px-5 py-3 text-sm font-bold text-white hover:bg-[#7d3511] disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save settings
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}