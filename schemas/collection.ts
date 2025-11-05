// lib/schemas/collection.ts
import { z } from "zod";

export const createCollectionSchema = z.object({
  handle: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  seoId: z.string().uuid().optional(),
  parentId: z.string().optional().nullable(),
  gender: z.enum(["men", "women", "general"]),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const attachProductSchema = z.object({
  productId: z.string().uuid(),
  order: z.number().int().optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type AttachProductInput = z.infer<typeof attachProductSchema>;

// app/collections/types.ts

export type ProductSummary = {
  id: string;
  title: string;
  handle?: string | null;
  /**
   * URL to a product image (nullable).
   * Prefer the featured image or the first image in the product images array.
   */
  image?: string | null;
  /**
   * Price in smallest unit or numeric representation you use in the UI.
   * If your DB uses Decimal, convert to number before passing to the UI.
   */
  price?: number | null;
};

export type FormattedCollection = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  seoId?: string | null;
  /**
   * Count of assigned products (useful for list views).
   */
  productCount: number;
  /**
   * Optional thumbnail (string URL) used in list views.
   */
  image?: string | null;
  createdAt: string; // ISO string
  updatedAt?: string | null; // ISO string or null
};

/**
 * Full collection payload for detail pages / edit forms.
 * `products` is a lightweight list of products assigned to the collection.
 */
export type CollectionWithProducts = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  seoId?: string | null;
  products: ProductSummary[];
  createdAt: string;
  updatedAt?: string | null;
};
