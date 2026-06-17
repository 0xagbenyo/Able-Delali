import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiUrl, assertApiJsonResponse } from "../lib/apiUrl";
import { applyCmsApiMeta, type CmsSectionsApiResponse } from "../lib/cmsApiMeta";

export type HomepageSectionPayload = {
  template: string;
  key: string;
  values: Record<string, string>;
};

type ApiResponse = CmsSectionsApiResponse & {
  sections: HomepageSectionPayload[];
  web_page?: { name: string; title?: string; route?: string } | null;
};

type Ctx = {
  loading: boolean;
  error: string | null;
  valuesByKey: ReadonlyMap<string, Record<string, string>>;
};

const HomepageCMSContext = createContext<Ctx | null>(null);

const DEFAULT_SECTIONS_URL = "/api/homepage/sections";

export function HomepageCMSProvider({
  children,
  /** e.g. `/api/public-voice/sections` for the standalone speaking & media Web Page in ERPNext. */
  sectionsUrl = DEFAULT_SECTIONS_URL,
}: {
  children: ReactNode;
  sectionsUrl?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<ReadonlyMap<string, Record<string, string>>>(
    () => new Map(),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(sectionsUrl), { cache: "no-store" });
        assertApiJsonResponse(res, "Homepage sections");
        const data = (await res.json()) as ApiResponse;
        if (cancelled) return;
        applyCmsApiMeta(data);
        const m = new Map<string, Record<string, string>>();
        for (const s of data.sections || []) {
          m.set(s.key, s.values);
        }
        setMap(m);
        if (!data.ok && data.error) setError(data.error);
        else setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "fetch_failed");
          setMap(new Map());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sectionsUrl]);

  const value = useMemo<Ctx>(
    () => ({ loading, error, valuesByKey: map }),
    [loading, error, map],
  );

  return (
    <HomepageCMSContext.Provider value={value}>
      {children}
    </HomepageCMSContext.Provider>
  );
}

/** Normalized Web Template key: `About teaser` → `about_teaser` */
export function useHomepageSectionValues(key: string): Record<string, string> {
  const ctx = useContext(HomepageCMSContext);
  const norm = key.trim().toLowerCase().replace(/\s+/g, "_");
  if (!ctx) return {};
  return ctx.valuesByKey.get(norm) ?? {};
}

export function useHomepageCMSMeta(): { loading: boolean; error: string | null } {
  const ctx = useContext(HomepageCMSContext);
  return { loading: ctx?.loading ?? false, error: ctx?.error ?? null };
}
