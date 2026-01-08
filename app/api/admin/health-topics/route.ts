// app/api/admin/health-topics/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from "zod";

export const runtime = 'nodejs';

const bodySchema = z.object({
  title: z.string().min(1),
  handle: z.string().min(1),
  description: z.string().optional().default(""),
  seo: z
    .object({
      title: z.string().optional().nullable().default(""),
      description: z.string().optional().nullable().default(""),
    })
    .optional()
    .nullable(),
  relatedProductIds: z.array(z.string()).optional().default([]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bodySchema.parse(body);

    // Create SEO if present (we still create if empty strings to keep consistency)
    let seoId: string | undefined = undefined;
    if (parsed.seo) {
      const createdSeo = await prisma.sEO.create({
        data: {
          title: parsed.seo.title ?? "",
          description: parsed.seo.description ?? "",
        },
      });
      seoId = createdSeo.id;
    }

    // Create HealthTopic
    const created = await prisma.healthTopic.create({
      data: {
        title: parsed.title,
        handle: parsed.handle,
        description: parsed.description ?? "",
        seoId: seoId ?? undefined,
      },
    });

    // Create join rows (if any)
    const toCreate = (parsed.relatedProductIds || []).map((productId, idx) => ({
      healthTopicId: created.id,
      productId,
      order: idx,
    }));

    if (toCreate.length > 0) {
      await prisma.healthTopicProduct.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }

    const response = await prisma.healthTopic.findUnique({
      where: { id: created.id },
      include: {
        relatedProducts: { include: { product: true }, orderBy: { order: "asc" } },
        seo: true,
      },
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("POST /api/admin/health-topics error:", err);
    if (err?.name === "ZodError") {
      return NextResponse.json({ message: "Invalid payload", errors: err.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
