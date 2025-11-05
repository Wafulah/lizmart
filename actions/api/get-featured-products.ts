import prisma from "../../lib/prisma";

export type FeaturedProduct = {
  id: string;
  title: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  collectionName: string;
  imageURL: string;
  featured?: boolean;
};

export async function getFeaturedProducts(limit = 8): Promise<FeaturedProduct[]> {
  const productsRaw = await prisma.product.findMany({
    where: {
      featured: true,
      availableForSale: true,
    },
    include: {
      featuredImage: true,
      variants: true,
      images: true,
      CollectionProduct: {
        include: {
          collection: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  const products: FeaturedProduct[] = productsRaw.map((p) => {
    const firstVariant = p.variants[0];
    const price = firstVariant?.priceAmount?.toNumber() || 0;
    const compareAtPrice = firstVariant?.priceAmount?.toNumber();

    const collectionName =
      p.CollectionProduct?.[0]?.collection?.title || "General";

    const imageURL = p.featuredImage?.url || p.images?.[0]?.url || "/placeholder-image.png";

    return {
      id: p.id,
      handle: p.handle,
      title: p.title,
      price,
      compareAtPrice,
      collectionName,
      imageURL,
      featured: true,
    };
  });

  return products;
}
