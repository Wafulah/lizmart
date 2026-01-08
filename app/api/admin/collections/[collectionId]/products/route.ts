// app/api/collections/[collectionId]/products/route.ts
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await context.params;
    if (!collectionId) {
      return NextResponse.json({ error: "Missing collectionId" }, { status: 400 });
    }

    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);

    const [total, products] = await Promise.all([
      prisma.product.count({
        where: { collections: { some: { id: collectionId } } }
      }),
      prisma.product.findMany({
        where: { collections: { some: { id: collectionId } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return NextResponse.json(
      {
        data: products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('GET /api/collections/[collectionId]/products', err);
    return NextResponse.json(
      { error: 'Failed to fetch collection products' },
      { status: 500 }
    );
  }
}

