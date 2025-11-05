// /lib/validations/product.ts (example path)
import { z } from "zod";

const SelectedOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const VariantSchema = z.object({
  title: z.string(),
  availableForSale: z.boolean().optional(),
  selectedOptions: z.array(SelectedOptionSchema).optional().nullable(),
  // accept string or number for price (we convert later)
  priceAmount: z.union([z.string(), z.number()]).optional(),
  priceCurrency: z.string().optional(),
  sku: z.string().optional().nullable(),
});

const ImageSchema = z.object({
  url: z.string().url(),
  altText: z.string().optional().nullable(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
});

export const createProductSchema = z.object({
  // Product core
  handle: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  descriptionHtml: z.string().optional().nullable(),
  availableForSale: z.boolean().optional(),

  // options = product-level option definitions, flexible JSON
  options: z.any().optional().nullable(),

  // min/max variant prices can be string|number|null
  minVariantPriceAmount: z.union([z.string(), z.number()]).optional().nullable(),
  minVariantPriceCurrency: z.string().optional().nullable(),
  maxVariantPriceAmount: z.union([z.string(), z.number()]).optional().nullable(),
  maxVariantPriceCurrency: z.string().optional().nullable(),

  featuredImageId: z.string().optional().nullable(),

  // tags array
  tags: z.array(z.string()).optional(),

  // images & variants
  images: z.array(ImageSchema).optional(),
  variants: z.array(VariantSchema).optional(),

  // collections: array of collection IDs to connect
  collectionIds: z.array(z.string()).optional(),

  // SEO fields (create inline)
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),

  // optional: legacy seoId (if you ever want to pass an existing seo id)
  seoId: z.string().optional().nullable(),
  featured: z.boolean(),
});


export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof createProductSchema>;
