export type AdminMenuItemData = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminMenuCategoryOption = {
  id: string;
  name: string;
  active: boolean;
};

export type CreateAdminMenuItemInput = {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  featured: boolean;
};

export type UpdateAdminMenuItemInput = {
  categoryId?: string;
  name?: string;
  description?: string | null;
  price?: number;
  available?: boolean;
  featured?: boolean;
  sortOrder?: number;
};

type MenuItemsResponse = {
  items: AdminMenuItemData[];
};

type MenuItemResponse = {
  message: string;
  item: AdminMenuItemData;
};

type DeleteMenuItemResponse = {
  message: string;
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

export async function getAdminMenuItems(): Promise<
  AdminMenuItemData[]
> {
  const response = await fetch("/api/admin/menu-items", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const result = await readResponse<MenuItemsResponse>(
    response,
    "Unable to load menu items.",
  );

  return result.items;
}

export async function createAdminMenuItem(
  input: CreateAdminMenuItemInput,
): Promise<MenuItemResponse> {
  const response = await fetch("/api/admin/menu-items", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "same-origin",
    body: JSON.stringify(input),
  });

  return readResponse<MenuItemResponse>(
    response,
    "Unable to create the menu item.",
  );
}

export async function updateAdminMenuItem(
  itemId: string,
  input: UpdateAdminMenuItemInput,
): Promise<MenuItemResponse> {
  const response = await fetch(
    `/api/admin/menu-items/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "same-origin",
      body: JSON.stringify(input),
    },
  );

  return readResponse<MenuItemResponse>(
    response,
    "Unable to update the menu item.",
  );
}

export async function deleteAdminMenuItem(
  itemId: string,
): Promise<DeleteMenuItemResponse> {
  const response = await fetch(
    `/api/admin/menu-items/${encodeURIComponent(itemId)}`,
    {
      method: "DELETE",
      credentials: "same-origin",
    },
  );

  return readResponse<DeleteMenuItemResponse>(
    response,
    "Unable to delete the menu item.",
  );
}