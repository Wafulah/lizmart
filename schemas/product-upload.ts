import * as z from "zod";

const SelectedOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const VariantSchema = z.object({
  title: z.string().min(1, { message: "Variant title is required." }),
  availableForSale: z.boolean().optional(),
  // selectedOptions: [{ name, value }, ...]
  selectedOptions: z.array(SelectedOptionSchema).optional(),
  // price can be string or number in the form; we'll normalize on submit
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

// product-level options definition: [{ name: "Color", values: ["Black","White"] }, ...]
const ProductOptionsSchema = z
  .array(
    z.object({
      name: z.string(),
      values: z.array(z.string()),
    })
  )
  .optional()
  .nullable();

export const formSchema = z.object({
  handle: z.string().min(1, { message: "Handle is required." }),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional().nullable(),
  descriptionHtml: z.string().optional().nullable(),
  availableForSale: z.boolean().optional(),

  // product-level options definition (colors, sizes, etc.)
  options: ProductOptionsSchema,

  // min/max prices (stored as Int in DB: smallest unit). Keep as numbers here.
  minVariantPriceAmount: z.number().int().optional().nullable(),
  minVariantPriceCurrency: z.string().optional().nullable(),
  maxVariantPriceAmount: z.number().int().optional().nullable(),
  maxVariantPriceCurrency: z.string().optional().nullable(),
  

  featuredImageId: z.string().optional().nullable(),

  // tags array
  tags: z.array(z.string()).optional(),

  // images (from your ImageUpload component)
  images: z.array(ImageSchema),

  // variants (each variant contains selectedOptions, price, sku, etc.)
  variants: z.array(VariantSchema),

  // collections to connect to (array of collection ids)
  collectionIds: z.array(z.string()).optional(),

  // SEO (inline create) or reference to existing seo record
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoId: z.string().optional().nullable(),
  gender: z.string(),
  featured: z.boolean(),
});

export type ProductFormValues = z.infer<typeof formSchema>;
