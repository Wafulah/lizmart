// actions/api/get-products-by-collection.ts
import prisma from "@/lib/prisma";
import { reshapeProduct } from "@/lib/server-helpers/reshapeProduct";

export type ProductLite = {
  id: string;
  title: string;
  description?: string;
  price: number;
  currencyCode?: string;
  images?: any[];
  featuredImage?: any;
  variants?: any[];
  seo?: any;
  createdAt?: Date;
};

export async function getProductsByCollection({
  collectionHandle,
  gender,
  page = 1,
  perPage = 12,
  sortKey,
  reverse = false,
}: {
  collectionHandle: string;
  gender?: string | undefined;
  page?: number;
  perPage?: number;
  sortKey?: string;
  reverse?: boolean;
}) {
  if (!collectionHandle || typeof collectionHandle !== "string") {
    return { items: [], total: 0, totalPages: 1, page: 1, perPage };
  }

  const normalized = collectionHandle.trim().toLowerCase();

  // Step 1: Find collection(s) matching handle or title
  const collections = await prisma.collection.findMany({
    where: {
      OR: [
        { handle: { equals: normalized } },
        { handle: { contains: normalized } },
        { title: { contains: normalized, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  if (!collections.length) {
    return { items: [], total: 0, totalPages: 1, page: 1, perPage };
  }

  const collectionIds = collections.map((c) => c.id);

  // Step 2: Pagination
  const take = Math.max(1, Math.min(100, perPage));
  const skip = Math.max(0, (page - 1) * take);

  // Step 3: Sorting
  const orderBy: any = {};
  if (sortKey) orderBy[sortKey] = reverse ? "asc" : "desc";
  else orderBy["createdAt"] = reverse ? "asc" : "desc";

  // Step 4: Build WHERE clause dynamically
  const whereBase: any = {
    availableForSale: true,
    CollectionProduct: {
      some: { collectionId: { in: collectionIds } },
    },
  };

  if (gender && gender !== "general") {
    whereBase.gender = gender;
  }

  // Step 5: Fetch total count and paginated products
  const total = await prisma.product.count({ where: whereBase });

  const productsRaw = await prisma.product.findMany({
    where: whereBase,
    include: {
      images: true,
      featuredImage: true,
      variants: true,
      seo: true,
    },
    orderBy,
    skip,
    take,
  });

  const items = productsRaw.map(reshapeProduct).filter(Boolean) as ProductLite[];
  const totalPages = Math.max(1, Math.ceil(total / take));

  return { items, total, page, perPage: take, totalPages };
}
