# NEO Digital Studio

Сайт цифровой студии. React + TypeScript + Vite, чистый CSS. Founded by Neki.

## Запуск

```bash
npm install
cp .env.example .env
npm run dev
npm run build
```

## Хостинг: что выбрать

| Вариант | Когда | База |
|--------|--------|------|
| **PocketBase** (Railway / VPS / Fly) | Нужны заявки, админка, файлы без боли | встроенный SQLite |
| HandyHost / Reg.ru + PHP + MySQL | Уже есть shared-хостинг, только PHP | MySQL |
| Статика (Cloudflare Pages, Vercel) | Только лендинг, формы через сторонний сервис | нет |

**Рекомендация для NEO:** PocketBase. Один бинарник, REST + realtime, auth, файлы. Фронт — статика (`dist/`), формы бьют в `VITE_FORM_ENDPOINT` (коллекция `orders`). Секреты (VK/Telegram токены) живут только в PocketBase hooks или отдельном edge-функции, не в `VITE_*`.

Railway удобен для PocketBase; Reg.ru/HandyHost — если принципиально PHP+MySQL.

## Контент

- `public/data.json` — тарифы и проекты (можно править без пересборки)
- Редактор: `/admin.html` (сохранение в браузер + выгрузка JSON)
- Тексты секций: `src/content.ts`

## Редактор

`/#admin` — вход по паролю из `.env` → `VITE_ADMIN_PASSWORD`.
После входа можно сохранять тарифы/проекты в браузере или скачать `data.json`.

## Env

Только публичное. Токены ботов и пароли БД — никогда в `VITE_*`.

## Перед продом

1. `.env` с Telegram / endpoint
2. Сменить доступ к редактору
3. Поднять PocketBase (или PHP API) под заявки
4. Проверка на iPhone / Android
