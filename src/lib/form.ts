export type FormState = { ok: boolean; error?: string };
export const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v.trim() : "";
};
export const opt = (f: FormData, k: string) => str(f, k) || null;
export const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
export const isTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
