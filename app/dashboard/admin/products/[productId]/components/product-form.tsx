"use client";

import { formSchema } from "@/schemas/product-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { LuTrash2 as Trash } from "react-icons/lu";
import * as z from "zod";

import { ProductOptionsForm } from "@/components/ProductsOptionsForm";
import { ProductVariantsForm } from "@/components/ProductVariantsForm";


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Image,
  Product,
  ProductVariant,
  SEO
} from '@/generated/prisma';
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertModal } from "@/components/ui/dashboard/alert-modal";
import { Heading } from "@/components/ui/dashboard/heading";
import ImageUpload from "@/components/ui/dashboard/image-upload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
    initialData:
        | (Product & {
              images: Image[];
  variants: ProductVariant[];
  CollectionProduct: { collectionId: string }[];
  featuredImage: Image | null;
  seo: SEO | null;
          })
        | null;

    collections: { id: string; title: string }[];
}

export type VariantFormValues = {
  title: string;
  priceAmount: string;
  priceCurrency: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
};

const availableTags = [
  "New Arrival",
  "Limited Edition",
  "Best Seller",
  "Sale",
  "Trending",
  "Exclusive",
];


export function ProductVariantsFormWrapper({ initialVariants }: { initialVariants?: VariantFormValues[] }) {
  const { watch } = useFormContext<{ options: { name: string; values: string[] }[] }>();
  const options = watch("options") || [];

  return <ProductVariantsForm options={options} initialVariants={initialVariants} />;
}


export const ProductForm: React.FC<ProductFormProps> = ({ initialData, collections }) => {
    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit product" : "Create product";
    const description = initialData ? "Edit a product." : "Add a new product";
    const toastMessage = initialData ? "Product updated." : "Product created.";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<ProductFormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: initialData
    ? {
        handle: initialData.handle,
        title: initialData.title,
        description: initialData.description,
        descriptionHtml: initialData.descriptionHtml,
        availableForSale: initialData.availableForSale,
        options: Array.isArray(initialData.options)
          ? (initialData.options as { name: string; values: string[] }[])
          : [],
        minVariantPriceAmount: initialData.minVariantPriceAmount,
        minVariantPriceCurrency: initialData.minVariantPriceCurrency,
        maxVariantPriceAmount: initialData.maxVariantPriceAmount,
        maxVariantPriceCurrency: initialData.maxVariantPriceCurrency,
        featuredImageId: initialData.featuredImage?.id ?? null,
        tags: initialData.tags ?? [],
        images: initialData.images ?? [],
        variants: initialData.variants?.map((variant) => ({
          title: variant.title,
          availableForSale: variant.availableForSale,
          selectedOptions: Array.isArray(variant.selectedOptions)
            ? (variant.selectedOptions as { name: string; value: string }[])
            : [], // ✅ Convert JSON to array or fallback
          priceAmount: variant.priceAmount != null ? String(variant.priceAmount) : "",
          priceCurrency: variant.priceCurrency,
          sku: variant.sku ?? "",
        })) ?? [],
        collectionIds: initialData.CollectionProduct
          ? initialData.CollectionProduct.map((cp) => cp.collectionId)
          : [],
        seoTitle: initialData.seo?.title ?? null,
        seoDescription: initialData.seo?.description ?? null,
        seoId: initialData.seo?.id ?? null,
      }
    : {
        handle: "",
        title: "",
        description: null,
        descriptionHtml: null,
        availableForSale: true,
        options: [],
        minVariantPriceAmount: null,
        minVariantPriceCurrency: null,
        maxVariantPriceAmount: null,
        maxVariantPriceCurrency: null,
        featuredImageId: null,
        tags: [],
        images: [],
        variants: [],
        collectionIds: [],
        seoTitle: null,
        seoDescription: null,
        seoId: null,
      },
});


  const onSubmit = async (data: ProductFormValues) => {
  try {
    setLoading(true);

    // Build payload with everything (including images)
    const payload = {
      ...data,
      minVariantPriceAmount: data.minVariantPriceAmount?.toString() ?? null,
      maxVariantPriceAmount: data.maxVariantPriceAmount?.toString() ?? null,
      tags: data.tags,
      variants: (data.variants ?? []).map(v => ({
    ...v,
    priceAmount: v.priceAmount != null ? String(v.priceAmount) : null,
  })),
    };

    if (initialData) {
      await axios.patch(
        `/api/admin/products/${params.productId}`,
        payload
      );
      
    } else {
      await axios.post(`/api/admin/products`, payload);
      
    }


    toast.success(toastMessage);
    router.refresh();
    router.push(`/dashboard/admin/products`);
    
  } catch (error: any) {
    toast.error("Something went wrong.");
  } finally {
    setLoading(false);
  }
};

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(
                `/api/admin/products/${params.productId}`
            );
            router.refresh();
            router.push(`/dashboard/admin/products`);
            toast.success("Product deleted.");
        } catch (error: any) {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading title={title} description={description} />
                {initialData && (
                    <Button
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 w-full"
                >
                            <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload 
                    value={field.value.map((image) => image.url)} 
                    disabled={loading} 
                    onChange={(url) => field.onChange([...field.value, { url }])}
                    onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
                    <div className="md:grid md:grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="Product title"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="handle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Handle</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            placeholder="product-handle-name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
        

                         <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="col-span-3">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            disabled={loading}
                                            placeholder="Product description"
                                            {...field}
                                            value={field.value ?? undefined}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* SEO Title */}
<FormField
  control={form.control}
  name="seoTitle"
  render={({ field }) => (
    <FormItem className="col-span-3">
      <FormLabel>SEO Title</FormLabel>
      <FormControl>
        <Input
          disabled={loading}
          placeholder="SEO-friendly product title"
          {...field}
          value={field.value ?? ""}
        />
      </FormControl>
      <FormDescription>
        Appears in search engine results (keep under 60 characters).
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

{/* SEO Description */}
<FormField
  control={form.control}
  name="seoDescription"
  render={({ field }) => (
    <FormItem className="col-span-3">
      <FormLabel>SEO Description</FormLabel>
      <FormControl>
        <Textarea
          disabled={loading}
          placeholder="Brief SEO description for search engines"
          {...field}
          value={field.value ?? ""}
        />
      </FormControl>
      <FormDescription>
        Keep under 160 characters for best SEO results.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

{/* Collections / Multi-Select */}
<FormField
  control={form.control}
  name="collectionIds"
  render={({ field }) => {
    // Get selected collection objects
    const selectedCollections =
      collections.filter((c) => field.value?.includes(c.id)) ?? [];

    return (
      <FormItem className="col-span-3">
        <FormLabel>Collections</FormLabel>
        <FormControl>
          <Select
            value="" // Keep empty to allow multiple selections
            onValueChange={(value) => {
              if (field.value?.includes(value)) {
                // Remove if already selected
                field.onChange(field.value.filter((v) => v !== value));
              } else {
                // Add new selection
                field.onChange([...(field.value ?? []), value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue>
                {selectedCollections.length > 0
                  ? selectedCollections.map((c) => c.title).join(", ")
                  : "Select one or more collections"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {collections?.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.title}
                  {field.value?.includes(collection.id) && " ✓"} {/* optional tick */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
        <FormDescription>
          Select one or multiple collections this product belongs to.
        </FormDescription>
        <FormMessage />
      </FormItem>
    );
  }}
/>


               {/* Tags Multi-Select */}
<FormField
  control={form.control}
  name="tags"
  render={({ field }) => {
    const selectedTags = field.value ?? [];

    return (
      <FormItem className="col-span-3">
        <FormLabel>Tags</FormLabel>
        <FormControl>
          <Select
            value="" // keep empty so you can select multiple
            onValueChange={(value) => {
              if (selectedTags.includes(value)) {
                // Remove tag if already selected
                field.onChange(selectedTags.filter((t: string) => t !== value));
              } else if (selectedTags.length < 3) {
                // Add tag if under the limit
                field.onChange([...selectedTags, value]);
              } else {
                toast("You can select up to 3 tags only.");
              }
            }}
          >
            <SelectTrigger>
              <SelectValue>
                {selectedTags.length > 0
                  ? selectedTags.join(", ")
                  : "Select up to 3 tags"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag} {selectedTags.includes(tag) && "✓"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
        <FormDescription>
          Choose up to three tags for this product.
        </FormDescription>
        <FormMessage />
      </FormItem>
    );
  }}
/>


{/* Product Options JSON Input */}
<ProductOptionsForm />
<ProductVariantsForm
  options={form.watch("options") ?? []}
  initialVariants={
    initialData?.variants?.map((variant) => ({
      title: variant.title ?? "",
      priceAmount: variant.priceAmount != null ? String(variant.priceAmount) : "",
      priceCurrency: variant.priceCurrency ?? "KES",
      availableForSale: variant.availableForSale ?? true,
      selectedOptions:
        Array.isArray(variant.selectedOptions)
          ? variant.selectedOptions.map((opt: any) => ({
              name: opt.name ?? "",
              value: opt.value ?? "",
            }))
          : [],
    })) ?? []
  }
/>

                    </div>
                    <div className="flex items-center gap-4">
                        <FormField
                            control={form.control}
                            name="availableForSale"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            // @ts-ignore
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Available for Sale</FormLabel>
                                        <FormDescription>
                                            This product will be visible on the storefront.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    );
};