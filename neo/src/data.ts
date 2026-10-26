import { useEffect, useState } from "react";
export type Plan = { name: string; who: string; price: string; term: string; include: string[]; exclude: string[]; need: string };
export type Project = { title: string; category: string; task: string; solution: string; tech: string[]; url?: string; image?: string };
export type Extra = { name: string; price: string };
export type SiteData = { plans: Plan[]; projects: Project[]; extras: Extra[] };
// Читается из public/data.json в рантайме: правка файла не требует пересборки кода.
export function useData(): SiteData | null {
  const [d, setD] = useState<SiteData | null>(null);
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "data.json", { cache: "no-cache" })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((j: Partial<SiteData>) => setD({ plans: j.plans ?? [], projects: j.projects ?? [], extras: j.extras ?? [] }))
      .catch(() => setD({ plans: [], projects: [], extras: [] }));
  }, []);
  return d;
}
