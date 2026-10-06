export type AdminThemeConfig = {
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  successColor: string;
};

export type AdminCafeSettingsData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsappNumber: string;
  active: boolean;
  themeConfig: AdminThemeConfig;
  updatedAt: string;
};

export type UpdateAdminCafeSettingsInput = {
  name: string;
  description: string;
  whatsappNumber: string;
  themeConfig: AdminThemeConfig;
};

type CafeSettingsResponse = {
  cafe: AdminCafeSettingsData;
};

type UpdateCafeSettingsResponse = {
  message: string;
  cafe: AdminCafeSettingsData;
};

type ErrorResponse = {
  error?: string;
};

async function readResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }

  if (!response.ok) {
    const errorResponse = result as ErrorResponse;

    throw new Error(
      errorResponse.error?.trim() || fallbackMessage,
    );
  }

  return result as T;
}

export async function getAdminCafeSettings(): Promise<AdminCafeSettingsData> {
  const response = await fetch("/api/admin/settings", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const result = await readResponse<CafeSettingsResponse>(
    response,
    "Unable to load cafe settings.",
  );

  return result.cafe;
}

export async function updateAdminCafeSettings(
  input: UpdateAdminCafeSettingsInput,
): Promise<UpdateCafeSettingsResponse> {
  const response = await fetch("/api/admin/settings", {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "same-origin",
    body: JSON.stringify(input),
  });

  return readResponse<UpdateCafeSettingsResponse>(
    response,
    "Unable to update cafe settings.",
  );
}