import { useEffect, useState } from "react";

export type Plan = {
  name: string;
  who: string;
  price: string;
  term: string;
  include: string[];
  exclude: string[];
  need: string;
};
export type Project = {
  title: string;
  category: string;
  task: string;
  solution: string;
  tech: string[];
  url?: string;
  image?: string;
};
export type Extra = { name: string; price: string };
export type SiteData = { plans: Plan[]; projects: Project[]; extras: Extra[] };

const STORAGE_KEY = "neo_site_data_v1";

export function loadStored(): SiteData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as Partial<SiteData>;
    return { plans: j.plans ?? [], projects: j.projects ?? [], extras: j.extras ?? [] };
  } catch {
    return null;
  }
}

export function saveStored(data: SiteData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearStored(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function useData(): SiteData | null {
  const [d, setD] = useState<SiteData | null>(null);
  useEffect(() => {
    const stored = loadStored();
    fetch(import.meta.env.BASE_URL + "data.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: Partial<SiteData>) => {
        const base: SiteData = {
          plans: j.plans ?? [],
          projects: j.projects ?? [],
          extras: j.extras ?? [],
        };
        setD(stored ?? base);
      })
      .catch(() => setD(stored ?? { plans: [], projects: [], extras: [] }));
  }, []);
  return d;
}
