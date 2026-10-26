// Единая точка настройки публичных контактов (значения из .env, только VITE_*)
const env = import.meta.env;
const u = ((env.VITE_TELEGRAM_USERNAME as string) || "").replace(/^@/, "").trim();
export const config = {
  telegramUrl: u ? `https://t.me/${u}` : "",
  email: ((env.VITE_CONTACT_EMAIL as string) || "").trim(),
  siteUrl: ((env.VITE_SITE_URL as string) || "").trim(),
  formEndpoint: ((env.VITE_FORM_ENDPOINT as string) || "").trim(),
};
