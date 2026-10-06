export type AdminCategoryData = {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type UpdateAdminCategoryInput = {
  name?: string;
  active?: boolean;
  sortOrder?: number;
};

type CategoryResponse = {
  message: string;
  category: AdminCategoryData;
};

type CategoriesResponse = {
  categories: AdminCategoryData[];
};

type DeleteCategoryResponse = {
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

export async function getAdminCategories(): Promise<
  AdminCategoryData[]
> {
  const response = await fetch("/api/admin/categories", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const result = await readResponse<CategoriesResponse>(
    response,
    "Unable to load categories.",
  );

  return result.categories;
}

export async function createAdminCategory(
  name: string,
): Promise<CategoryResponse> {
  const response = await fetch("/api/admin/categories", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "same-origin",

    body: JSON.stringify({
      name,
    }),
  });

  return readResponse<CategoryResponse>(
    response,
    "Unable to create the category.",
  );
}

export async function updateAdminCategory(
  categoryId: string,
  input: UpdateAdminCategoryInput,
): Promise<CategoryResponse> {
  const response = await fetch(
    `/api/admin/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "same-origin",
      body: JSON.stringify(input),
    },
  );

  return readResponse<CategoryResponse>(
    response,
    "Unable to update the category.",
  );
}

export async function deleteAdminCategory(
  categoryId: string,
): Promise<DeleteCategoryResponse> {
  const response = await fetch(
    `/api/admin/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "DELETE",
      credentials: "same-origin",
    },
  );

  return readResponse<DeleteCategoryResponse>(
    response,
    "Unable to delete the category.",
  );
}