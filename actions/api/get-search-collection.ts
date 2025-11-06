
import prisma from "@/lib/prisma";

export type NavCollection = {
  id: string;
  handle: string;
  title: string;
  parentId?: string | null;
  gender?: string | null;
  path?: string;
  description?: string | null;
  updatedAt?: string | null;
};

export async function getCollections(): Promise<NavCollection[]> {
  const cols = await prisma.collection.findMany({
    orderBy: { title: "asc" },
    // include seo if you need it: include: { seo: true }
  });

  return cols
    .filter((c) => !c.handle.startsWith("hidden"))
    .map((c) => ({
      id: c.id,
      handle: c.handle,
      title: c.title,
      parentId: c.parentId ?? null,
      gender: c.gender ?? "general",
      description: c.description ?? null,
      updatedAt: c.updatedAt ? c.updatedAt.toISOString() : undefined,
      path: `/search/${c.handle}`
    }));
}
