// components/layout/search/collections.tsx
import clsx from "clsx";
import { Suspense } from "react";
import { getCollections } from "@/actions/api/get-search-collection";
import FilterList from "./filter";

type NavCollection = {
  id: string;
  handle: string;
  title: string;
  parentId?: string | null;
  gender?: string | null;
  path?: string;
};

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Server component that fetches collections and returns a deduplicated list
 * grouped by title. NO gender filtering here — sidebar is purely collections.
 */
async function CollectionList() {
  const collections = await getCollections(); // returns NavCollection[]

  // Group by normalized title (lowercase) to dedupe
  const groups = new Map<
    string,
    { title: string; handles: string[]; anyHandle: string }
  >();

  for (const c of collections) {
    const key = (c.title ?? "").trim().toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, { title: c.title, handles: [c.handle], anyHandle: c.handle });
    } else {
      const cur = groups.get(key)!;
      cur.handles.push(c.handle);
    }
  }

  // Build the list — each item links to /search/{slug}
  const items: { title: string; path: string; handles: string[] }[] = [];

  for (const [key, value] of groups.entries()) {
    const slug = slugify(value.title);
    items.push({
      title: value.title,
      path: `/search/${encodeURIComponent(slug)}`,
      handles: value.handles
    });
  }

  return <FilterList list={items} title="Collections" />;
}

const skeleton = "mb-3 h-4 w-5/6 animate-pulse rounded-sm";
const activeAndTitles = "bg-neutral-800 dark:bg-neutral-300";
const items = "bg-neutral-400 dark:bg-neutral-700";

export default function Collections() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
        </div>
      }
    >
      
      <CollectionList />
    </Suspense>
  );
}
