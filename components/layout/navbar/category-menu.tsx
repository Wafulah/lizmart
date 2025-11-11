"use client";

import { ChevronDown, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import ProfileDropdown from "@/components/ProfileDropdown";

// --- NEW TYPE FOR HEALTH TOPICS ---
export type NavHealthTopic = {
  id: string;
  handle: string;
  title: string;
};

type NavCollection = {
  id: string;
  handle: string;
  title: string;
  parentId?: string | null;
  gender?: string | null;
  path?: string;
  children?: NavCollection[];
};

type TopMenuItem = {
  title: string;
  path?: string;
  key?: string; // used to filter collections (e.g. 'men','women','sports','categories')
  filterFn?: (c: NavCollection) => boolean; // optional override
};

const PHONE_NUMBER = "011 750 5979";

/**
 * Edit/add top-level menu items here.
 */
const TOP_MENU: TopMenuItem[] = [
  { title: "HOME", path: "/" },
  // --- ADDED HEALTH TOPICS TAB ---
  { title: "BY HEALTH NEED", path: "/search/health", key: "health-topics" },
  // ---------------------------------
  { title: "UNISEX", path: "/search", key: "categories" }, // shows general
  { title: "MEN", path: "/search/men", key: "men" },
  { title: "WOMEN", path: "/search/ladies", key: "women" },
  { title: "SPORTS", path: "/search/sports?gender=general", key: "sports" },
  { title: "SKIN CARE", path: "/search/dermatological-health?gender=general", key: "dermatological-health" },
  { title: "ABOUT US", path: "/about-us" },
];

/* ---------- helpers ---------- */

// build a tree from flat collection list
function buildTree(items: NavCollection[]) {
  const map = new Map<string, NavCollection>();
  items.forEach((it) => map.set(it.id, { ...it, children: [] }));

  const roots: NavCollection[] = [];
  map.forEach((node) => {
    const pid = node.parentId ?? null;
    if (pid && map.has(pid)) {
      map.get(pid)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// get collections for a given top-menu key using simple rules (you can extend)
function collectionsForKey(
  key: string | undefined,
  all: NavCollection[]
): NavCollection[] {
  if (!key || key === "categories") {
    // CATEGORIES: only general
    return all.filter((c) => (c.gender ?? "general") === "general");
  }

  if (key === "men") {
    // MEN: only men
    return all.filter((c) => (c.gender ?? "") === "men");
  }

  if (key === "women") {
    // WOMEN: only women
    return all.filter((c) => (c.gender ?? "") === "women");
  }

  if (key === "sports") {
    // SPORTS: gender = sports or keyword in title/handle
    return all.filter(
      (c) =>
        (c.gender ?? "") === "sports" ||
        c.handle?.toLowerCase().includes("sport") ||
        c.title?.toLowerCase().includes("sport")
    );
  }

  if (key === "dermatological-health") {
    // DERMATOLOGICAL HEALTH: keyword-based
    return all.filter(
      (c) =>
        c.handle?.toLowerCase().includes("dermatolog") ||
        c.title?.toLowerCase().includes("dermatolog") ||
        c.handle?.toLowerCase().includes("skin") ||
        c.title?.toLowerCase().includes("skin")
    );
  }

  // fallback: general
  return all.filter((c) => (c.gender ?? "general") === "general");
}

/* ---------- component ---------- */

// --- UPDATED PROPS TO INCLUDE healthTopics ---
export default function FullCommerceNavbar({
  collections,
  healthTopics,
}: {
  collections: NavCollection[];
  healthTopics: NavHealthTopic[]; // NEW PROP
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/dashboard/admin")) return null;

  // dropdown controller
  const [openKey, setOpenKey] = useState<string | null>(null);
  const closeTimeout = useRef<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
    };
  }, []);

  const openDropdown = (key: string) => {
    if (closeTimeout.current) {
      window.clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpenKey(key);
  };
  const closeDropdownWithDelay = (delay = 200) => {
    if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
    closeTimeout.current = window.setTimeout(() => setOpenKey(null), delay);
  };

  const handleLink = (path: string) => {
    router.push(path);
    setOpenKey(null);
    setIsDrawerOpen(false);
  };

  // render nested children recursively
  function renderChildren(children?: NavCollection[]) {
    if (!children || children.length === 0) return null;
    return (
      <ul className="mt-2 space-y-1">
        {children.map((ch) => (
          <li key={ch.id} className="text-sm">
            <Link
              href={`/search/${ch.handle}`}
              className="block px-2 py-1 hover:bg-teal-50 rounded text-gray-700"
              onClick={(e) => {
                /* nothing else required — Link handles navigation */
              }}
            >
              {ch.title}
            </Link>

            {/* recursively render deeper levels */}
            <div className="pl-4">{renderChildren(ch.children)}</div>
          </li>
        ))}
      </ul>
    );
  }

  // --- NEW HealthTopicPanel Component ---
  // Renders the mega-panel specifically for Health Topics in a 4-column grid
  function HealthTopicPanel() {
    if (!healthTopics.length) return null;

    // Determine the number of topics per column for a 4-column layout
    const perCol = Math.ceil(healthTopics.length / 4) || 1;
    const cols: NavHealthTopic[][] = [];
    for (let i = 0; i < healthTopics.length; i += perCol)
      cols.push(healthTopics.slice(i, i + perCol));

    // Styling to match the image: blue background, 4 columns
    const menuBgClass = "bg-white"; 
    const linkClass =
      "text-sm font-semibold text-teal-700 mb-2 transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-teal-50 block px-2 py-1 rounded";

    return (
      <div
        className={`w-[60vw] overflow-y-auto absolute left-0 top-full mt-2 z-40 shadow-2xl border-t-4 border-teal-600 ${menuBgClass}`}
        onMouseEnter={() => openDropdown("health-topics")}
        onMouseLeave={() => closeDropdownWithDelay()}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {cols.map((col, i) => (
            <div key={i} className="space-y-4">
              {col.map((topic) => (
                <div key={topic.id}>
                  <Link
                    href={`/health-need/${topic.handle}`}
                    className={linkClass}
                    onClick={() => {
                      setOpenKey(null);
                      setIsDrawerOpen(false);
                    }}
                  >
                    {topic.title}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  // --- END NEW HealthTopicPanel Component ---

  // Renders the mega-panel for a given top-menu entry
  function MegaPanel({ keyName }: { keyName?: string }) {
    if (!keyName) return null;

    // --- CONDITIONAL RENDERING ---
    if (keyName === "health-topics") {
      return <HealthTopicPanel />;
    }
    // --- END CONDITIONAL RENDERING ---

    // get filtered collections and build root-level groups (parents)
    const filtered = collectionsForKey(keyName, collections);
    if (!filtered.length) return null;
    const tree = buildTree(filtered);

    // split top-level groups into columns (responsive)
    const perCol = Math.ceil(tree.length / 3) || 1;
    const cols: NavCollection[][] = [];
    for (let i = 0; i < tree.length; i += perCol)
      cols.push(tree.slice(i, i + perCol));

    return (
      <div
        className="overflow-y-auto absolute left-0 top-full mt-2 z-40 w-[60vw] md:w-[40vw] bg-white shadow-lg border-t-4 border-teal-600"
        onMouseEnter={() => keyName && openDropdown(keyName)}
        onMouseLeave={() => closeDropdownWithDelay()}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cols.map((col, i) => (
            <div key={i} className="space-y-4">
              {col.map((cat) => (
                <div key={cat.id}>
                  <h4 className="text-sm font-semibold text-teal-700 mb-2">
                    {cat.title}
                  </h4>
                  {renderChildren(cat.children)}
                  {/* if no children, offer link to the category itself */}
                  {!cat.children?.length && (
                    <div className="mt-1">
                      <Link
                        href={`/search/${cat.handle}`}
                        className="text-sm text-gray-700 hover:text-teal-600"
                      >
                        View {cat.title}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Mobile drawer */
  const MobileDrawer = () => (
    <>
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto lg:hidden ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-3 border-b">
          <div className="font-semibold">Menu</div>
          <button onClick={() => setIsDrawerOpen(false)} className="p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3">
          <ul className="space-y-2">
            {TOP_MENU.map((m) => (
              <li key={m.title}>
                <button
                  onClick={() => {
                    if (m.path) handleLink(m.path);
                    else setIsDrawerOpen(false);
                  }}
                  className="w-full text-left py-2 px-2 rounded hover:bg-teal-50"
                >
                  {m.title}
                </button>

                {/* show mobile expanded list for special keys */}
                {m.key && (
                  <div className="pl-4 mt-2">
                    {/* --- MOBILE LOGIC FOR HEALTH TOPICS --- */}
                    {m.key === "health-topics" ? (
                      <ul className="space-y-1">
                        {healthTopics.map((topic) => (
                          <li key={topic.id}>
                            <Link
                              href={`/search/health/${topic.handle}`}
                              className="text-sm block py-1 text-gray-700 hover:text-teal-600"
                              onClick={() => setIsDrawerOpen(false)}
                            >
                              {topic.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      // --- EXISTING COLLECTION LOGIC ---
                      (() => {
                        const filtered = collectionsForKey(m.key, collections);
                        const tree = buildTree(filtered);

                        return tree.map((cat) => (
                          <details key={cat.id} className="mb-2">
                            <summary className="font-medium cursor-pointer">
                              {cat.title}
                            </summary>

                            {/* children */}
                            <ul className="pl-4 mt-2">
                              {(cat.children || []).map((ch) => (
                                <li key={ch.id}>
                                  <Link
                                    href={`/search/${ch.handle}`}
                                    className="text-sm block py-1 text-gray-700 hover:text-teal-600"
                                  >
                                    {ch.title}
                                  </Link>

                                  {/* recursively render deeper children */}
                                  {ch.children && ch.children.length > 0 && (
                                    <ul className="pl-4 mt-1">
                                      {ch.children.map((sub) => (
                                        <li key={sub.id}>
                                          <Link
                                            href={`/search/${sub.handle}`}
                                            className="text-xs block py-1 text-gray-600 hover:text-teal-500"
                                          >
                                            {sub.title}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </details>
                        ));
                      })()
                    )}
                  </div>
                )}
              </li>
            ))}
            <li className="border-t pt-2 mt-2">
              <ProfileDropdown />
            </li>
          </ul>

          <div className="mt-6 border-t pt-4">
            <a
              href={`tel:${PHONE_NUMBER.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-2 text-teal-600 font-semibold"
            >
              <Phone className="w-4 h-4" /> {PHONE_NUMBER}
            </a>
          </div>
        </nav>
      </aside>
    </>
  );

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm relative z-20">
      <MobileDrawer />
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <button
            className="p-2 lg:hidden text-gray-700 hover:text-black rounded-md"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* main nav */}
        <ul className="hidden lg:flex items-center gap-6 text-xs font-medium text-gray-700 tracking-wide">
          {TOP_MENU.map((m) => {
            const key = m.key;
            const isOpen = key ? openKey === key : false;

            if (key) {
              return (
                <li
                  key={m.title}
                  className="relative"
                  onMouseEnter={() => openDropdown(key)}
                  onMouseLeave={() => closeDropdownWithDelay()}
                >
                  <Link
  href={m.path || "#"} 
  className="py-3 px-2 hover:text-teal-600 transition duration-150 flex items-center gap-1"
  aria-expanded={isOpen} 
  onClick={() => {      
      setOpenKey(null); 
  }}
>
                    <span>{m.title}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Link>

                  {isOpen && <MegaPanel keyName={key} />}
                </li>
              );
            } else {
              return (
                <li key={m.title}>
                  <Link
                    href={m.path || "/"}
                    className="py-3 px-2 hover:text-teal-600 transition duration-150"
                  >
                    {m.title}
                  </Link>
                </li>
              );
            }
          })}
          <ProfileDropdown />
        </ul>

        {/* right side phone */}
        <div className="hidden sm:flex items-center">
          <a
            href={`tel:${PHONE_NUMBER.replace(/[^0-9+]/g, "")}`}
            className="flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm hover:bg-teal-100 transition"
          >
            <Phone className="w-4 h-4" />
            <span className="select-none">{PHONE_NUMBER}</span>
          </a>
        </div>
      </div>
    </nav>
  );
}