// prisma-provider.ts
import { currentUser } from "@/lib/auth";
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma';
import {
  Cart,
  Collection,
  Image as ImageType,
  Menu as MenuType,
  Page,
  Product,
  SEO
} from './types'; // keep same types you already had

/* Helpers */

// Accept currency possibly null and normalize
const money = (amount?: any, currency?: string | null) => ({
  amount: amount !== null && amount !== undefined ? String(amount) : '0.0',
  currencyCode: currency ?? 'KES'
});

const toImage = (img: any): ImageType => ({
  url: img?.url ?? '',
  altText: img?.altText ?? '',
  width: img?.width ?? 0,
  height: img?.height ?? 0
});


function normalizeSeo(seo: { title: string | null; description: string | null } | null | undefined): SEO {
  return {
    title: seo?.title ?? 'Shop',
    description: seo?.description ?? 'Purchase this high quality product' 
  };
}

const reshapeProduct = (p: any): Product | undefined => {
  if (!p) return undefined;

  const images = (p.images || []).map(toImage);
  const variants = (p.variants || []).map((v: any) => ({
    id: v.id,
    title: v.title,
    availableForSale: v.availableForSale ?? true,
    selectedOptions: v.selectedOptions || [],
    price: money(v.priceAmount !== undefined && v.priceAmount !== null ? v.priceAmount.toString() : undefined, v.priceCurrency ?? null)
  }));

  // Ensure featuredImage is ALWAYS an Image (so Product.featuredImage: Image stays valid)
  const featuredImage: ImageType = p.featuredImage
    ? toImage(p.featuredImage)
    : images.length > 0
    ? images[0]
    : {
        url: '',
        altText: p.title ? `${p.title} - image` : '',
        width: 0,
        height: 0
      };
  
  return {
    id: p.id,
    handle: p.handle,
    availableForSale: p.availableForSale ?? true,
    title: p.title,
    description: p.description ?? '',
    descriptionHtml: p.descriptionHtml ?? '',
    options: p.options ?? [],
    priceRange: {
  maxVariantPrice: money(p.maxVariantPriceAmount !== undefined && p.maxVariantPriceAmount !== null ? String(p.maxVariantPriceAmount) : undefined, p.maxVariantPriceCurrency ?? null),
  minVariantPrice: money(p.minVariantPriceAmount !== undefined && p.minVariantPriceAmount !== null ? String(p.minVariantPriceAmount) : undefined, p.minVariantPriceCurrency ?? null)
},
    variants,
    featuredImage,
    images,
    seo: normalizeSeo(p.seo),
    tags: p.tags || [],
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString()
  };
};

/* Cart helpers */

const recalcCartTotals = async (cartId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { lines: { include: { variant: true } } }
  });
  if (!cart) return null;

  // Sum the line totalAmount fields (line.totalAmount is expected to be the amount for that line)
  const subtotalNum = cart.lines.reduce((acc, l) => {
  const amt = l.totalAmount !== null && l.totalAmount !== undefined ? Number(l.totalAmount) : 0;
  return acc + amt;
}, 0);

  const totalQuantity = cart.lines.reduce((acc, l) => acc + (l.quantity ?? 0), 0);

  const currency = cart.lines[0]?.currency ?? 'KES';

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotalAmount: subtotalNum,
      subtotalCurrency: currency,
      totalAmount: subtotalNum,
      totalCurrency: currency,
      totalTaxAmount: '0.0',
      totalQuantity
    }
  });

  return prisma.cart.findUnique({
    where: { id: cartId },
    include: { lines: { include: { variant: { include: { product: { include: { featuredImage: true, images: true } } } } } } }
  });
};

/* Exported functions (same signatures as Shopify provider) */

export async function createCart(): Promise<Cart> {
  const created = await prisma.cart.create({
    data: {
  subtotalAmount: "0.0",
  subtotalCurrency: 'KES',
  totalAmount: "0.0",
  totalCurrency: 'KES',
  totalTaxAmount: "0.0",
  taxCurrency: 'KES',
  totalQuantity: 0
},
    include: { lines: true }
  });

  return {
    id: created.id,
    checkoutUrl: created.checkoutUrl ?? '',
    cost: {
      subtotalAmount: money(created.subtotalAmount, created.subtotalCurrency ?? null),
      totalAmount: money(created.totalAmount, created.totalCurrency ?? null),
      totalTaxAmount: money(created.totalTaxAmount, created.taxCurrency ?? null)
    },
    lines: [], // empty initially
    totalQuantity: created.totalQuantity ?? 0
  } as unknown as Cart;
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cartIdCookie = (await cookies()).get('cartId')?.value;
  const user = await currentUser();
  let cartRecord: any = null;

  if (!cartIdCookie) {
    cartRecord = await prisma.cart.create({
      data: {
        subtotalAmount: '0.0',
        subtotalCurrency: 'KES',
        totalAmount: '0.0',
        totalCurrency: 'KES',
        totalTaxAmount: '0.0',
        taxCurrency: 'KES',
        totalQuantity: 0,
        userId: user?.id ?? null,
      }
    });
  } else {
    cartRecord = await prisma.cart.findUnique({ where: { id: cartIdCookie } });
    if (!cartRecord) {
      cartRecord = await prisma.cart.create({
        data: {
          subtotalAmount: 0.0,
          subtotalCurrency: 'KES',
          totalAmount: 0.0,
          totalCurrency: 'KES',
          totalTaxAmount: 0.0,
          taxCurrency: 'KES',
          totalQuantity: 0,
          userId: user?.id ?? null,
        }
      });
    }
  }

  const resolvedCartId = cartRecord.id;

  for (const line of lines) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: line.merchandiseId },
      include: { product: { include: { featuredImage: true,images: true } } }
    });

    if (!variant) {
      throw new Error(`Variant ${line.merchandiseId} not found`);
    }

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: resolvedCartId, variantId: variant.id }
    });

    const variantPrice = variant.priceAmount !== null && variant.priceAmount !== undefined ? Number(variant.priceAmount) : 0;
    const lineTotal = variantPrice * line.quantity;

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + line.quantity,
          totalAmount: (Number(existing.totalAmount ?? 0) + lineTotal).toString()
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: resolvedCartId,
          variantId: variant.id,
          quantity: line.quantity,
          totalAmount: lineTotal.toString(),
          currency: variant.priceCurrency ?? 'KES',
          merchandiseSnapshot: {
            id: variant.id,
            title: variant.title,
            selectedOptions: variant.selectedOptions || [],
            product: {
              id: variant.product?.id ?? '',
              handle: variant.product?.handle ?? '',
              title: variant.product?.title ?? '',
              featuredImage: variant.product?.featuredImage ?? null,
              images: variant.product?.images ?? []
            }
          }
        }
      });
    }
  }

  const updated = await recalcCartTotals(resolvedCartId);
  if (!updated) throw new Error('Failed to update cart totals');

  return {
    id: updated.id,
    checkoutUrl: updated.checkoutUrl ?? '',
    cost: {
      subtotalAmount: money(updated.subtotalAmount, updated.subtotalCurrency ?? null),
      totalAmount: money(updated.totalAmount, updated.totalCurrency ?? null),
      totalTaxAmount: money(updated.totalTaxAmount, updated.taxCurrency ?? null)
    },
    lines: (updated.lines || []).map((l: any) => ({
      id: l.id,
      quantity: l.quantity,
      cost: { totalAmount: money(l.totalAmount, l.currency ?? null) },
      merchandise: {
        id: l.variantId ?? l.merchandiseSnapshot?.id,
        title: l.merchandiseSnapshot?.title ?? l.variant?.title ?? '',
        selectedOptions: l.merchandiseSnapshot?.selectedOptions ?? [],
        product: {
          id: l.merchandiseSnapshot?.product?.id ?? l.variant?.product?.id ?? '',
          handle: l.merchandiseSnapshot?.product?.handle ?? l.variant?.product?.handle ?? '',
          title: l.merchandiseSnapshot?.product?.title ?? l.variant?.product?.title ?? '',
          images: l.merchandiseSnapshot?.product?.images ?? l.variant?.product?.images ?? [],
        }
      }
    })),
    totalQuantity: updated.totalQuantity ?? 0
  } as unknown as Cart;
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartId = (await cookies()).get('cartId')?.value;
  if (!cartId) throw new Error('No cart id in cookies');

  await prisma.cartItem.deleteMany({
    where: {
      cartId,
      id: { in: lineIds }
    }
  });

  const updated = await recalcCartTotals(cartId);
  if (!updated) throw new Error('Cart not found');

  return {
    id: updated.id,
    checkoutUrl: updated.checkoutUrl ?? '',
    cost: {
      subtotalAmount: money(updated.subtotalAmount, updated.subtotalCurrency ?? null),
      totalAmount: money(updated.totalAmount, updated.totalCurrency ?? null),
      totalTaxAmount: money(updated.totalTaxAmount, updated.taxCurrency ?? null)
    },
    lines: (updated.lines || []).map((l: any) => ({
      id: l.id,
      quantity: l.quantity,
      cost: { totalAmount: money(l.totalAmount, l.currency ?? null) },
      merchandise: {
        id: l.variantId ?? l.merchandiseSnapshot?.id,
        title: l.merchandiseSnapshot?.title ?? l.variant?.title ?? '',
        selectedOptions: l.merchandiseSnapshot?.selectedOptions ?? [],
        product: {
          id: l.merchandiseSnapshot?.product?.id ?? l.variant?.productId ?? '',
          handle: l.merchandiseSnapshot?.product?.handle ?? l.variant?.product?.handle ?? '',
          title: l.merchandiseSnapshot?.product?.title ?? l.variant?.product?.title ?? '',
          images: l.merchandiseSnapshot?.product?.images ?? l.variant?.product?.images ?? [],
        }
      }
    })),
    totalQuantity: updated.totalQuantity ?? 0
  } as unknown as Cart;
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cartId = (await cookies()).get('cartId')?.value;
  if (!cartId) throw new Error('No cart id in cookies');

  for (const l of lines) {
    const cartItem = await prisma.cartItem.findUnique({ where: { id: l.id }, include: { variant: true } });
    if (!cartItem) continue;

    const variantPrice = cartItem.variant?.priceAmount !== null && cartItem.variant?.priceAmount !== undefined ? Number(cartItem.variant.priceAmount) : Number(cartItem.totalAmount ?? 0);
    const newTotal = variantPrice * l.quantity;

    await prisma.cartItem.update({
      where: { id: l.id },
      data: {
        quantity: l.quantity,
        totalAmount: newTotal.toString()
      }
    });
  }

  const updated = await recalcCartTotals(cartId);
  if (!updated) throw new Error('Cart not found');

  return {
    id: updated.id,
    checkoutUrl: updated.checkoutUrl ?? '',
    cost: {
      subtotalAmount: money(updated.subtotalAmount, updated.subtotalCurrency ?? null),
      totalAmount: money(updated.totalAmount, updated.totalCurrency ?? null),
      totalTaxAmount: money(updated.totalTaxAmount, updated.taxCurrency ?? null)
    },
    lines: (updated.lines || []).map((l: any) => ({
      id: l.id,
      quantity: l.quantity,
      cost: { totalAmount: money(l.totalAmount, l.currency ?? null) },
      merchandise: {
        id: l.variantId ?? l.merchandiseSnapshot?.id,
        title: l.merchandiseSnapshot?.title ?? l.variant?.title ?? '',
        selectedOptions: l.merchandiseSnapshot?.selectedOptions ?? [],
        product: {
          id: l.merchandiseSnapshot?.product?.id ?? l.variant?.productId ?? '',
          handle: l.merchandiseSnapshot?.product?.handle ?? l.variant?.product?.handle ?? '',
          title: l.merchandiseSnapshot?.product?.title ?? l.variant?.product?.title ?? '',
          images: l.merchandiseSnapshot?.product?.images ?? l.variant?.product?.images ?? [],
        }
      }
    })),
    totalQuantity: updated.totalQuantity ?? 0
  } as unknown as Cart;
}

export async function getCart(): Promise<Cart | undefined> {
  const cartId = (await cookies()).get('cartId')?.value;
  if (!cartId) return undefined;

  const c = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { lines: { include: { variant: { include: { product: { include: { featuredImage: true, images: true } } } } } } }
  });
  if (!c) return undefined;

  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl ?? '',
    cost: {
      subtotalAmount: money(c.subtotalAmount, c.subtotalCurrency ?? null),
      totalAmount: money(c.totalAmount, c.totalCurrency ?? null),
      totalTaxAmount: money(c.totalTaxAmount, c.taxCurrency ?? null)
    },
    lines: (c.lines || []).map((l: any) => ({
      id: l.id,
      quantity: l.quantity,
      cost: { totalAmount: money(l.totalAmount, l.currency ?? null) },
      merchandise: {
        id: l.variantId ?? l.merchandiseSnapshot?.id,
        title: l.merchandiseSnapshot?.title ?? l.variant?.title ?? '',
        selectedOptions: l.merchandiseSnapshot?.selectedOptions ?? [],
        product: {
          id: l.merchandiseSnapshot?.product?.id ?? l.variant?.product?.id ?? '',
          handle: l.merchandiseSnapshot?.product?.handle ?? l.variant?.product?.handle ?? '',
          title: l.merchandiseSnapshot?.product?.title ?? l.variant?.product?.title ?? '',
          images: l.merchandiseSnapshot?.product?.images ?? l.variant?.product?.images ?? [],
        }
      }
    })),
    totalQuantity: c.totalQuantity ?? 0
  } as unknown as Cart;
}

/* Collections & Products */

export async function getCollection(handle: string): Promise<Collection | undefined> {
  const c = await prisma.collection.findUnique({
    where: { handle },
    include: { seo: true }
  });
  if (!c) return undefined;

  return {
    handle: c.handle,
    title: c.title,
    description: c.description ?? '',
    seo: normalizeSeo(c.seo),
    updatedAt: c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString(),
    path: `/search/${c.handle}`
  } as Collection;
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const col = await prisma.collection.findUnique({
    where: { handle: collection },
    include: { products: { include: { product: { include: { images: true, featuredImage: true, variants: true, seo: true } } } } }
  });

  if (!col) return [];

  const products = col.products.map((cp: any) => cp.product);
  return products.map(reshapeProduct).filter(Boolean) as Product[];
}

export async function getCollections(): Promise<Collection[]> {
  const cols = await prisma.collection.findMany({ include: { seo: true } });
  const reshaped = cols.map((c) => ({
    handle: c.handle,
    title: c.title,
    description: c.description ?? '',
    seo: normalizeSeo(c.seo),
    updatedAt: c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString(),
    path: `/search/${c.handle}`
  } as Collection));

  return [
    {
      handle: '',
      title: 'All',
      description: 'All products',
      seo: { title: 'All', description: 'All products' },
      updatedAt: new Date().toISOString(),
      path: '/search'
    } as Collection,
    ...reshaped.filter((c) => !c.handle.startsWith('hidden'))
  ];
}

export async function getMenu(handle: string): Promise<MenuType[]> {
  const m = await prisma.menu.findUnique({ where: { handle } });
  if (!m) return [];

  const items = (m.items as any) || [];
  return items.map((it: any) => ({
    title: it.title,
    path: String(it.url || '')
      .replace(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '', '')
      .replace('/collections', '/search')
      .replace('/pages', '')
  }));
}

export async function getPage(handle: string): Promise<Page> {
  const p = await prisma.page.findUnique({ where: { handle }, include: { seo: true } });
  if (!p) throw new Error('Page not found');
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    body: p.body ?? '',
    bodySummary: p.bodySummary ?? '',
    seo: normalizeSeo(p.seo),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString()
  } as Page;
}

export async function getPages(): Promise<Page[]> {
  const pages = await prisma.page.findMany({ include: { seo: true } });
  return pages.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    body: p.body ?? '',
    bodySummary: p.bodySummary ?? '',
    seo: normalizeSeo(p.seo),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString()
  }));
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const p = await prisma.product.findUnique({
    where: { handle },
    include: {
      images: true,
      featuredImage: true,
      variants: true,
      seo: true,
      CollectionProduct: {
        include: {
          collection: true,
        },
      },
    },
  });

  if (!p) return undefined;

  return reshapeProduct(p);
}


export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const where: any = {};
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } }
    ];
  }
  const items = await prisma.product.findMany({
    where,
    include: { images: true, featuredImage: true, variants: true, seo: true },
    take: 100
  });

  return items.map(reshapeProduct).filter(Boolean) as Product[];
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  const p = await prisma.product.findUnique({ where: { id: productId } });
  if (!p) return [];

  const tags = p.tags || [];
  if (!tags.length) return [];

  const candidates = await prisma.product.findMany({
    where: {
      id: { not: productId },
      tags: { hasSome: tags }
    },
    include: { images: true, featuredImage: true, variants: true, seo: true },
    take: 8
  });

  return candidates.map(reshapeProduct).filter(Boolean) as Product[];
}

/* revalidate: keep signature although for Prisma you will trigger it manually when needed */
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    return NextResponse.json({ status: 401 });
  }
  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
