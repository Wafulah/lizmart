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
  gender?: string;
  page?: number;
  perPage?: number;
  sortKey?: string;
  reverse?: boolean;
}) {
  if (!collectionHandle || typeof collectionHandle !== "string") {
    return { items: [], total: 0, totalPages: 1, page: 1, perPage };
  }

  const normalized = collectionHandle.trim().toLowerCase();

  // Step 1: Find main and child collections
  const mainCollections = await prisma.collection.findMany({
    where: {
      OR: [
        { handle: { equals: normalized } },
        { handle: { contains: normalized } },
        { title: { contains: normalized, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  // If main collection found, get all its children too
  const mainIds = mainCollections.map((c) => c.id);
  let allCollectionIds = [...mainIds];

  if (mainIds.length > 0) {
    const childCollections = await prisma.collection.findMany({
      where: { parentId: { in: mainIds } },
      select: { id: true },
    });
    allCollectionIds = [...mainIds, ...childCollections.map((c) => c.id)];
  }

  // Fallback: If still nothing, match collections that contain term
  if (allCollectionIds.length === 0) {
    const fallback = await prisma.collection.findMany({
      where: {
        OR: [
          { handle: { contains: normalized } },
          { title: { contains: normalized, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    allCollectionIds = fallback.map((c) => c.id);
  }

  if (allCollectionIds.length === 0) {
    return { items: [], total: 0, totalPages: 1, page: 1, perPage };
  }

  // Step 2: Pagination setup
  const take = Math.max(1, Math.min(100, perPage));
  const skip = Math.max(0, (page - 1) * take);

  // Step 3: Sorting
  const orderBy: any = {};
  if (sortKey) orderBy[sortKey] = reverse ? "asc" : "desc";
  else orderBy["createdAt"] = reverse ? "asc" : "desc";

  // Step 4: Build query
  const whereBase: any = {
    availableForSale: true,
    CollectionProduct: {
      some: { collectionId: { in: allCollectionIds } },
    },
  };

  if (gender && gender !== "general") {
  // Main strict match
  whereBase.AND = [
    {
      OR: [
        { gender: { equals: gender, mode: "insensitive" } },
        { tags: { has: gender.toLowerCase() } },
        {
          AND: [
            { title: { contains: gender, mode: "insensitive" } },
            { title: { not: { contains: gender === "men" ? "women" : "men", mode: "insensitive" } } },
          ],
        },
        {
          AND: [
            { description: { contains: gender, mode: "insensitive" } },
            { description: { not: { contains: gender === "men" ? "women" : "men", mode: "insensitive" } } },
          ],
        },
      ],
    },
  ];
}


  // Step 5: Count + fetch
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
