// Публичные настройки из .env (префикс VITE_ → попадают в клиентский бандл).
const env = import.meta.env;
const u = ((env.VITE_TELEGRAM_USERNAME as string) || "").replace(/^@/, "").trim();
const tgUrl = ((env.VITE_TELEGRAM_URL as string) || "").trim();

export const config = {
  telegramUrl: tgUrl || (u ? `https://t.me/${u}` : ""),
  email: ((env.VITE_CONTACT_EMAIL as string) || "").trim(),
  siteUrl: ((env.VITE_SITE_URL as string) || "").trim(),
  formEndpoint: ((env.VITE_FORM_ENDPOINT as string) || "").trim(),
  pocketbaseUrl: ((env.VITE_POCKETBASE_URL as string) || "").trim(),
  /** Пароль редактора из .env. Пусто = редактор закрыт. */
  adminPassword: ((env.VITE_ADMIN_PASSWORD as string) || "").trim(),
};
