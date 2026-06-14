import { listERPNextDocuments, getERPNextDocument } from "./erpnextAuth.js";

export type BlogPost = {
  name: string;
  title: string;
  blog_category?: string;
  blogger?: string;
  route?: string;
  published_on?: string;
  featured?: boolean;
  blog_intro?: string;
  /** Frappe **Blog Post** `content` (Text Editor / HTML). Filled on single-post fetch. */
  content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_image?: string;
};

function unwrapDoc(res: unknown): Record<string, unknown> {
  if (res && typeof res === "object" && "data" in res) {
    const d = (res as { data: unknown }).data;
    if (d && typeof d === "object") return d as Record<string, unknown>;
  }
  return (res as Record<string, unknown>) ?? {};
}

/** Frappe **Blog Post** “Published” checkbox API name (default `published`). */
function blogPublishedFieldName(): string {
  const f = process.env.ERPNEXT_BLOG_PUBLISHED_FIELD?.trim();
  return f && f.length > 0 ? f : "published";
}

function truthyFromErp(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    return s === "1" || s === "yes" || s === "true" || s === "y";
  }
  return false;
}

function isBlogPostPublished(doc: Record<string, unknown>): boolean {
  const k = blogPublishedFieldName();
  return truthyFromErp(doc[k] ?? doc.published);
}

/** Load `content` (HTML body) — not included in list API to keep `/api/blog` light. */
async function mergeFullBlogBody(post: BlogPost): Promise<BlogPost | null> {
  try {
    const raw = await getERPNextDocument("Blog Post", post.name);
    const doc = unwrapDoc(raw);
    if (!isBlogPostPublished(doc)) {
      console.warn("[blogStore] Blog Post is not published:", post.name);
      return null;
    }
    const c = doc.content;
    if (typeof c === "string" && c.trim()) {
      return { ...post, content: c.trim() };
    }
    return { ...post };
  } catch (e) {
    console.warn("[blogStore] Full Blog Post GET failed:", post.name, e);
  }
  return post;
}

/**
 * Get all **published** blog posts (Frappe **Blog Post** `published` = 1 / checked).
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const pubField = blogPublishedFieldName();
    const result = await listERPNextDocuments(
      "Blog Post",
      { [pubField]: 1 },
      [
        "name",
        "title",
        "blog_category",
        "blogger",
        "route",
        "published_on",
        "featured",
        "blog_intro",
        "meta_title",
        "meta_description",
        "meta_image",
        pubField,
      ],
    );

    console.log("[Blog Store] Fetched posts:", result);

    const posts: BlogPost[] = [];
    if (result.data && Array.isArray(result.data)) {
      for (const doc of result.data) {
        const data = doc as any;
        posts.push({
          name: data.name || "",
          title: data.title || "",
          blog_category: data.blog_category || undefined,
          blogger: data.blogger || undefined,
          route: data.route || undefined,
          published_on: data.published_on || undefined,
          featured: data.featured || false,
          blog_intro: data.blog_intro || undefined,
          meta_title: data.meta_title || undefined,
          meta_description: data.meta_description || undefined,
          meta_image: data.meta_image || undefined,
        });
      }
    }

    // Sort by published_on date descending
    posts.sort((a, b) => {
      const dateA = new Date(a.published_on || 0).getTime();
      const dateB = new Date(b.published_on || 0).getTime();
      return dateB - dateA;
    });

    console.log("[Blog Store] Processed posts:", posts);
    return posts;
  } catch (error) {
    console.error("Failed to get blog posts from ERPNext:", error);
    throw error;
  }
}

/**
 * Get all blog categories from published posts
 */
export async function getBlogCategories(): Promise<string[]> {
  try {
    const allPosts = await getAllBlogPosts();
    
    // Extract unique categories
    const categoriesSet = new Set<string>();
    for (const post of allPosts) {
      if (post.blog_category) {
        categoriesSet.add(post.blog_category);
      }
    }
    
    // Convert to array and sort alphabetically
    const categories = Array.from(categoriesSet).sort();
    console.log("[Blog Store] Available categories:", categories);
    return categories;
  } catch (error) {
    console.error("Failed to get blog categories:", error);
    throw error;
  }
}

function normalizeRoutePath(route: string): string {
  return route.replace(/^\/+|\/+$/g, "");
}

/**
 * Get a single blog post by document name, full public route, or last segment of route
 * (Frappe often uses `name` as the doc id while `route` is the pretty URL path).
 */
export async function getBlogPostByRoute(blogNameRaw: string): Promise<BlogPost | null> {
  try {
    let key = blogNameRaw.trim();
    try {
      key = decodeURIComponent(key);
    } catch {
      /* keep key as-is */
    }
    key = key.trim();
    if (!key) return null;

    const allPosts = await getAllBlogPosts();
    console.log("[Blog Store] Looking for blog slug:", key);

    let found: BlogPost | null = null;

    const byName = allPosts.find((p) => p.name === key);
    if (byName) found = byName;
    else {
      const normKey = normalizeRoutePath(key);
      const byFullRoute = allPosts.find((p) => {
        const r = p.route?.trim();
        if (!r) return false;
        return normalizeRoutePath(r) === normKey;
      });
      if (byFullRoute) found = byFullRoute;
      else {
        const matchesLast = allPosts.filter((p) => {
          const parts = normalizeRoutePath(p.route || "")
            .split("/")
            .filter(Boolean);
          return parts.length > 0 && parts[parts.length - 1] === key;
        });
        if (matchesLast.length === 1) found = matchesLast[0]!;
        else if (matchesLast.length > 1) {
          console.warn(
            "[Blog Store] Multiple posts share route last segment; using first match:",
            key,
            matchesLast.map((p) => p.name),
          );
          found = matchesLast[0]!;
        }
      }
    }

    if (!found) return null;
    return (await mergeFullBlogBody(found)) ?? null;
  } catch (error) {
    console.error("Failed to get blog post:", error);
    throw error;
  }
}

/**
 * Get featured blog posts
 */
export async function getFeaturedBlogPosts(limit = 3): Promise<BlogPost[]> {
  try {
    const allPosts = await getAllBlogPosts();
    return allPosts.filter((p) => p.featured).slice(0, limit);
  } catch (error) {
    console.error("Failed to get featured blog posts:", error);
    throw error;
  }
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(
  category: string
): Promise<BlogPost[]> {
  try {
    const allPosts = await getAllBlogPosts();
    return allPosts.filter((p) => p.blog_category === category);
  } catch (error) {
    console.error("Failed to get blog posts by category:", error);
    throw error;
  }
}
