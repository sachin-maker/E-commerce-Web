
"use client";

import Link from "next/link";
import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  Edit3,
  PackagePlus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import AdminRoute from "@/app/components/auth/AdminRoute";
import {
  useCreateProductMutation,
  useDeactivateProductMutation,
  useGetAdminProductsQuery,
  useUpdateProductMutation,
} from "@/app/store/api/adminApi";

import type { Product } from "@/app/types/product";

import { getApiErrorMessage } from "@/lib/apiError";
import styles from "../AdminPages.module.css";

type ProductForm = {
  title: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  brand: string;
  thumbnail: string;
};

const emptyForm: ProductForm = {
  title: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  brand: "",
  thumbnail: "",
};

const MAX_TITLE_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_CATEGORY_LENGTH = 80;
const MAX_BRAND_LENGTH = 80;

const formatCurrency = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeValue);
};

const toForm = (product: Product): ProductForm => ({
  title: product.title ?? "",
  description: product.description ?? "",
  price: String(product.price ?? ""),
  stock: String(product.stock ?? ""),
  category: product.category ?? "",
  brand: product.brand ?? "",
  thumbnail: product.thumbnail ?? "",
});

const normalizeUrl = (value: string): string => {
  return value.trim();
};

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const [mutatingProductId, setMutatingProductId] = useState<string | null>(
    null,
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAdminProductsQuery({
    page,
    limit: 20,
    search: query,
  });

  const [createProduct, { isLoading: creating }] =
    useCreateProductMutation();

  const [updateProduct, { isLoading: updating }] =
    useUpdateProductMutation();

  const [deactivateProduct, { isLoading: deactivating }] =
    useDeactivateProductMutation();

  const saving = creating || updating;

  const updateField = (
    field: keyof ProductForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    resetForm();
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm(toForm(product));
  };

  const validateForm = (): string | null => {
    const title = form.title.trim();
    const description = form.description.trim();
    const category = form.category.trim();
    const brand = form.brand.trim();
    const thumbnail = normalizeUrl(form.thumbnail);

    if (!title) {
      return "Product title is required";
    }

    if (title.length > MAX_TITLE_LENGTH) {
      return `Product title cannot exceed ${MAX_TITLE_LENGTH} characters`;
    }

    if (!category) {
      return "Category is required";
    }

    if (category.length > MAX_CATEGORY_LENGTH) {
      return `Category cannot exceed ${MAX_CATEGORY_LENGTH} characters`;
    }

    if (!description) {
      return "Product description is required";
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return `Product description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (brand.length > MAX_BRAND_LENGTH) {
      return `Brand cannot exceed ${MAX_BRAND_LENGTH} characters`;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.price.trim() || !Number.isFinite(price) || price < 0) {
      return "Enter a valid product price";
    }

    if (
      !form.stock.trim() ||
      !Number.isFinite(stock) ||
      stock < 0 ||
      !Number.isInteger(stock)
    ) {
      return "Stock must be a whole number greater than or equal to 0";
    }

    if (!thumbnail) {
      return "Thumbnail URL is required";
    }

    try {
      const parsedUrl = new URL(thumbnail);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return "Thumbnail URL must use HTTP or HTTPS";
      }
    } catch {
      return "Enter a valid thumbnail URL";
    }

    return null;
  };

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      price,
      stock,
      category: form.category.trim().toLowerCase(),
      brand: form.brand.trim() || undefined,
      thumbnail: normalizeUrl(form.thumbnail),
    };

    try {
      if (editing) {
        setMutatingProductId(editing._id);

        await updateProduct({
          id: editing._id,
          changes: body,
        }).unwrap();

        toast.success("Product updated successfully");
      } else {
        await createProduct({
          ...body,
          images: [body.thumbnail],
          discountPercentage: 0,
          rating: 0,
          isActive: true,
        }).unwrap();

        toast.success("Product added to catalogue");
      }

      resetForm();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not save the product",
        ),
      );
    } finally {
      setMutatingProductId(null);
    }
  };

  const toggleActive = async (product: Product) => {
    if (mutatingProductId) {
      return;
    }

    if (product.isActive) {
      const confirmed = window.confirm(
        `Deactivate "${product.title}"?\n\nThe product will no longer be available for new purchases, but existing order history will be preserved.`,
      );

      if (!confirmed) {
        return;
      }
    }

    setMutatingProductId(product._id);

    try {
      if (product.isActive) {
        await deactivateProduct(product._id).unwrap();

        toast.success(
          "Product deactivated. Order history is preserved.",
        );
      } else {
        await updateProduct({
          id: product._id,
          changes: {
            isActive: true,
          },
        }).unwrap();

        toast.success("Product restored");
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not update product availability",
        ),
      );
    } finally {
      setMutatingProductId(null);
    }
  };

  const submitSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const nextQuery = search.trim();

    setPage(1);
    setQuery(nextQuery);
  };

  const clearSearch = () => {
    setSearch("");
    setQuery("");
    setPage(1);
  };

  const totalPages = Math.max(
    data?.pagination?.pages ?? 1,
    1,
  );

  const products = data?.products ?? [];
  const hasProducts = products.length > 0;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <AdminRoute>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <h1>Catalogue management</h1>

              <p>
                Add products, manage stock, and control product
                availability.
              </p>
            </div>

            <Link
              className={styles.link}
              href="/admin/dashboard"
            >
              Dashboard
            </Link>
          </header>

          <section
            className={styles.toolbar}
            aria-label="Product catalogue controls"
          >
            <form onSubmit={submitSearch}>
              <Search
                size={18}
                aria-hidden="true"
              />

              <label
                className={styles.visuallyHidden}
                htmlFor="product-search"
              >
                Search products
              </label>

              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search title, category, or brand"
                autoComplete="off"
                maxLength={100}
              />

              <button
                type="submit"
                disabled={isFetching}
              >
                {isFetching ? "Searching..." : "Search"}
              </button>

              {query && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={clearSearch}
                  disabled={isFetching}
                >
                  Clear
                </button>
              )}
            </form>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={openCreate}
              disabled={saving || Boolean(mutatingProductId)}
            >
              <PackagePlus
                size={17}
                aria-hidden="true"
              />
              Add product
            </button>
          </section>

          <section
            className={styles.formPanel}
            aria-labelledby="product-form-title"
          >
            <div>
              <h2 id="product-form-title">
                {editing
                  ? `Edit: ${editing.title}`
                  : "Add a product"}
              </h2>

              <p>
                {editing
                  ? "Update catalogue information and inventory."
                  : "Complete the product information below."}
              </p>
            </div>

            <form
              className={styles.form}
              onSubmit={submit}
              noValidate
            >
              <div>
                <label
                  className={styles.visuallyHidden}
                  htmlFor="product-title"
                >
                  Product title
                </label>

                <input
                  id="product-title"
                  required
                  value={form.title}
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value,
                    )
                  }
                  placeholder="Product title"
                  autoComplete="off"
                  maxLength={MAX_TITLE_LENGTH}
                />
              </div>

              <div>
                <label
                  className={styles.visuallyHidden}
                  htmlFor="product-category"
                >
                  Category
                </label>

                <input
                  id="product-category"
                  required
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value,
                    )
                  }
                  placeholder="Category"
                  autoComplete="off"
                  maxLength={MAX_CATEGORY_LENGTH}
                />
              </div>

              <div>
                <label
                  className={styles.visuallyHidden}
                  htmlFor="product-price"
                >
                  Price
                </label>

                <input
                  id="product-price"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(event) =>
                    updateField(
                      "price",
                      event.target.value,
                    )
                  }
                  placeholder="Price"
                />
              </div>

              <div>
                <label
                  className={styles.visuallyHidden}
                  htmlFor="product-stock"
                >
                  Stock
                </label>

                <input
                  id="product-stock"
                  required
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(event) =>
                    updateField(
                      "stock",
                      event.target.value,
                    )
                  }
                  placeholder="Stock"
                />
              </div>

              <div>
                <label
                  className={styles.visuallyHidden}
                  htmlFor="product-brand"
                >
                  Brand
                </label>

                <input
                  id="product-brand"
                  value={form.brand}
                  onChange={(event) =>
                    updateField(
                      "brand",
                      event.target.value,
                    )
                  }
                  placeholder="Brand (optional)"
                  autoComplete="organization"
                  maxLength={MAX_BRAND_LENGTH}
                />
              </div>

              <div>
                <label
                  className={styles.visuallyHidden}
                  htmlFor="product-thumbnail"
                >
                  Thumbnail URL
                </label>

                <input
                  id="product-thumbnail"
                  required
                  type="url"
                  value={form.thumbnail}
                  onChange={(event) =>
                    updateField(
                      "thumbnail",
                      event.target.value,
                    )
                  }
                  placeholder="Thumbnail URL"
                  autoComplete="url"
                />
              </div>

              <div>
                <label
                  className={styles.visuallyHidden}
                  htmlFor="product-description"
                >
                  Product description
                </label>

                <textarea
                  id="product-description"
                  required
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Product description"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={saving}
                  aria-busy={saving}
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save changes"
                      : "Create product"}
                </button>

                {editing && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </section>

          {isLoading && (
            <section
              className={styles.state}
              role="status"
              aria-live="polite"
            >
              Loading products...
            </section>
          )}

          {isError && !isLoading && (
            <section
              className={styles.error}
              role="alert"
            >
              <p>Unable to load products.</p>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? "Retrying..." : "Try again"}
              </button>
            </section>
          )}

          {!isLoading && !isError && (
            <>
              <div className={styles.tableWrap}>
                {hasProducts ? (
                  <table className={styles.table}>
                    <caption
                      className={styles.visuallyHidden}
                    >
                      Product catalogue management
                    </caption>

                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Category</th>
                        <th scope="col">Price</th>
                        <th scope="col">Stock</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.map((product) => {
                        const isMutatingThisProduct =
                          mutatingProductId === product._id;

                        const safeStock =
                          Number.isFinite(product.stock)
                            ? product.stock
                            : 0;

                        return (
                          <tr key={product._id}>
                            <td>
                              <div
                                className={styles.product}
                              >
                                <strong>
                                  {product.title ||
                                    "Untitled product"}
                                </strong>

                                <small>
                                  {product.brand ||
                                    "Unbranded"}
                                </small>
                              </div>
                            </td>

                            <td>
                              {product.category ||
                                "Uncategorized"}
                            </td>

                            <td>
                              {formatCurrency(
                                product.price,
                              )}
                            </td>

                            <td
                              className={
                                safeStock <= 5
                                  ? styles.lowStock
                                  : undefined
                              }
                            >
                              {safeStock}
                            </td>

                            <td>
                              <span
                                className={`${
                                  styles.badge
                                } ${
                                  product.isActive
                                    ? styles.active
                                    : styles.inactive
                                }`}
                              >
                                {product.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            <td>
                              <div
                                className={
                                  styles.rowActions
                                }
                              >
                                <button
                                  type="button"
                                  title="Edit product"
                                  aria-label={`Edit ${product.title}`}
                                  onClick={() =>
                                    openEdit(product)
                                  }
                                  disabled={
                                    Boolean(
                                      mutatingProductId,
                                    ) || saving
                                  }
                                >
                                  <Edit3
                                    size={16}
                                    aria-hidden="true"
                                  />
                                </button>

                                <button
                                  type="button"
                                  title={
                                    product.isActive
                                      ? "Deactivate product"
                                      : "Restore product"
                                  }
                                  aria-label={
                                    product.isActive
                                      ? `Deactivate ${product.title}`
                                      : `Restore ${product.title}`
                                  }
                                  onClick={() =>
                                    toggleActive(product)
                                  }
                                  disabled={
                                    Boolean(
                                      mutatingProductId,
                                    ) || saving
                                  }
                                  aria-busy={
                                    isMutatingThisProduct
                                  }
                                >
                                  {product.isActive ? (
                                    <Trash2
                                      size={16}
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <RotateCcw
                                      size={16}
                                      aria-hidden="true"
                                    />
                                  )}
                                </button>

                                {isMutatingThisProduct && (
                                  <span
                                    className={
                                      styles.visuallyHidden
                                    }
                                    role="status"
                                    aria-live="polite"
                                  >
                                    Updating product...
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p
                    className={styles.state}
                    role="status"
                  >
                    {query
                      ? `No products found for "${query}".`
                      : "No products found."}
                  </p>
                )}
              </div>

              <Pagination
                page={page}
                pages={totalPages}
                isFetching={isFetching}
                setPage={setPage}
              />
            </>
          )}
        </div>
      </main>
    </AdminRoute>
  );
}

interface PaginationProps {
  page: number;
  pages: number;
  isFetching: boolean;
  setPage: Dispatch<SetStateAction<number>>;
}

function Pagination({
  page,
  pages,
  isFetching,
  setPage,
}: PaginationProps) {
  if (pages < 2) {
    return null;
  }

  return (
    <nav
      className={styles.pagination}
      aria-label="Product pagination"
    >
      <button
        type="button"
        disabled={page <= 1 || isFetching}
        onClick={() =>
          setPage((currentPage) =>
            Math.max(currentPage - 1, 1),
          )
        }
      >
        Previous
      </button>

      <span
        className={styles.muted}
        aria-live="polite"
      >
        Page {page} of {pages}
      </span>

      <button
        type="button"
        disabled={page >= pages || isFetching}
        onClick={() =>
          setPage((currentPage) =>
            Math.min(currentPage + 1, pages),
          )
        }
      >
        Next
      </button>
    </nav>
  );
}


