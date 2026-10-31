# پلتفرم فرابی — معماری Frontend

این مخزن پیاده‌سازی «Senior Frontend Architecture Challenge» است: یک پلتفرم SaaS با چند محصول مستقل (**Admin** و **Profile**) که زیرساخت، احراز هویت، کامپوننت‌ها و قراردادهای API را به اشتراک می‌گذارند. تمرکز پروژه روی ساختار، مرزبندی ماژول‌ها و قابلیت توسعه توسط چند تیم است، نه ظاهر رابط کاربری.

## قابلیت‌ها

- **احراز هویت:** ورود، خروج، مسیرهای محافظت‌شده و کنترل دسترسی بر اساس نقش (`admin` / `member`).
- **Admin:** فهرست کاربران (جستجو و صفحه‌بندی)، مشاهده و ویرایش کاربر (نام، ایمیل، نقش، وضعیت).
- **Profile:** کاربر عادی فقط اطلاعات خودش را می‌بیند و فقط **نام** و **ایمیل** را ویرایش می‌کند.
- **API Mock:** با MSW؛ بدون هیچ تغییری در کد برنامه، به‌جای سرور واقعی پاسخ می‌دهد.

## اجرا

نیازمندی: Node.js 20 یا بالاتر.

```bash
npm install
npm run dev:admin     # http://localhost:5173
npm run dev:profile   # http://localhost:5174
```

| برنامه  | ایمیل               | رمز عبور    |
| ------- | ------------------- | ----------- |
| Admin   | `admin@farabi.test`  | `admin123`  |
| Profile | `member@farabi.test` | `member123` |

سایر دستورها: `npm run build:admin`، `npm run lint:admin`، `npm run format`.

نکته: داده‌های Mock در حافظه نگه‌داری می‌شوند و با رفرش صفحه به حالت اولیه برمی‌گردند. چون هر اپ روی Origin جداگانه‌ای اجرا می‌شود، توکن (localStorage) و داده‌ها بین دو اپ مشترک نیستند.

## معماری انتخاب‌شده

**Monorepo (npm workspaces)** شامل اپلیکیشن‌های مستقل و پکیج‌های مشترک:

```
apps/
  admin/      پنل مدیریت کاربران (مسیرهای /users و /users/:id)
  profile/    پروفایل کاربر جاری (مسیر /)
packages/
  contracts/  قرارداد داده: schemaهای Zod و تایپ‌ها (User, Session, Page, ...)
  api-client/ لایه HTTP: Transport، ApiError، fetch transport و ابزار Mock داخلی
  auth/       AuthProvider، useAuth، tokenStore، ProtectedRoute، RequireRole، LoginPage
  ui/         تم MUI، پشتیبانی RTL، فونت وزیرمتن، AppShell، PageHeader و ...
  mocks/      هندلرهای MSW (auth و users) و worker مرورگر
```

### جهت وابستگی‌ها

```
apps  ──►  auth ──► api-client ──► (هیچ)
  │         │
  │         └──► contracts
  ├──────► ui
  ├──────► contracts
  └──────► mocks (فقط dev، با dynamic import)
```

- پکیج‌ها هرگز به `apps` وابسته نیستند.
- `contracts` به هیچ پکیج دیگری وابسته نیست و تنها منبع حقیقت برای شکل داده‌هاست.
- `mocks` فقط در حالت توسعه بارگذاری می‌شود (`import.meta.env.DEV`) و وارد باندل production نمی‌شود.

### جریان یک درخواست

```
کامپوننت صفحه ─► hook در queries.ts (TanStack Query)
              ─► api.ts (متدهای تایپ‌شده)
              ─► HttpClient (افزودن توکن، تبدیل خطا به ApiError، مدیریت 401)
              ─► fetch('/api/...')  ◄── در dev توسط MSW پاسخ داده می‌شود
```

لایه‌های داخل هر اپ:

| فایل         | مسئولیت                                              |
| ------------ | ---------------------------------------------------- |
| `api.ts`     | فراخوانی endpointها، بدون هیچ وابستگی به React        |
| `queries.ts` | hookهای Query/Mutation و کلیدهای cache                |
| `pages/`     | کامپوننت‌های صفحه (lazy-loaded در router)             |
| `router.tsx` | تعریف مسیرها و ترکیب guardها                          |

## دلایل انتخاب تکنولوژی‌ها

| انتخاب | دلیل |
| ------ | ---- |
| **Monorepo با npm workspaces** | چند محصول با زیرساخت مشترک نیاز به تغییر اتمیک در چند پکیج دارند. بدون ابزار اضافه (Nx/Turborepo) شروع می‌شود و در صورت نیاز قابل افزودن است. |
| **پکیج‌های Source-only** (`main: src/index.ts`) | بدون مرحله build برای پکیج‌ها؛ HMR یکپارچه و تجربه توسعه ساده. |
| **Vite + React 19 + TypeScript strict** | سرعت توسعه و تایپ‌سیفتی کامل بین اپ‌ها و پکیج‌ها. |
| **React Router (data router + lazy)** | هر صفحه chunk جداگانه دارد؛ guardها به‌صورت layout route ترکیب می‌شوند. |
| **TanStack Query** | مدیریت وضعیت سرور (cache، loading، invalidation). حالت کلاینتی (مثل توکن) کوچک است و نیازی به store سراسری ندارد. |
| **Zod در `contracts`** | یک schema هم برای اعتبارسنجی فرم‌های کلاینت و هم برای اعتبارسنجی در هندلرهای Mock استفاده می‌شود؛ تایپ‌ها از آن استخراج می‌شوند. |
| **react-hook-form + zodResolver** | فرم‌ها با همان schemaهای قرارداد اعتبارسنجی می‌شوند. |
| **MUI + RTL (stylis-plugin-rtl) + وزیرمتن** | پیشنهاد صورت تسک؛ پشتیبانی راست‌به‌چپ در یک جا (`ui`) متمرکز است. |
| **MSW** | Mock در سطح شبکه است، پس کد اپ و `AuthProvider` تفاوتی بین Mock و سرور واقعی نمی‌بینند. همان هندلرها در تست (`msw/node`) قابل استفاده‌اند. |
| **`tokenStore` با `useSyncExternalStore`** | لایه HTTP (بدون React) می‌تواند روی 401 توکن را پاک کند و React به‌صورت خودکار واکنش نشان دهد. |

### احراز هویت و دسترسی

- `AuthProvider` وضعیت `loading | authenticated | unauthenticated` را از روی توکن و query مربوط به `/auth/me` می‌سازد.
- `ProtectedRoute` کاربر ناشناس را به `/login` می‌فرستد و مسیر مقصد را نگه می‌دارد.
- `RequireRole` دسترسی را بر اساس نقش محدود می‌کند؛ اپ Admin کل مسیرهایش را پشت `RequireRole roles={['admin']}` قرار داده است.
- در Mock، endpoint ویرایش پروفایل شناسه کاربر را از توکن می‌گیرد و فقط `name` و `email` را می‌پذیرد؛ یعنی کاربر عادی نمی‌تواند نقش یا رکورد دیگری را تغییر دهد. کنترل دسترسی نهایی باید همیشه سمت سرور باشد و guardهای کلاینت فقط تجربه کاربری هستند.

## توسعه پروژه

### افزودن Feature جدید به یک اپ

1. اگر داده جدید است، schema و تایپ را در `packages/contracts` اضافه کنید.
2. در اپ مربوطه `api.ts` و `queries.ts` را گسترش دهید (یا برای featureهای بزرگ‌تر پوشه `features/<name>/` شامل `api`، `queries`، `pages`، `components`).
3. صفحه را در `pages/` بسازید و در `router.tsx` با `lazy` ثبت کنید؛ guard مناسب را از `@farabitech/auth` بگذارید.
4. هندلر MSW مربوطه را در `packages/mocks/src` اضافه و در `handlers.ts` ثبت کنید تا فرانت بدون بک‌اند قابل توسعه باشد.

### افزودن محصول (اپ) جدید

1. پوشه جدید در `apps/` بسازید (از `apps/profile` کپی کنید)، پورت Vite را تنظیم کنید و `npx msw init public --save` را اجرا کنید.
2. `AppUIProvider`، `QueryClientProvider` و `AuthProvider` را مانند اپ‌های موجود در `main.tsx` سوار کنید.
3. اسکریپت `dev:<name>` را به `package.json` ریشه اضافه کنید.

### کار چند تیم

- هر تیم مالک یک اپ (یا feature) است؛ پکیج‌های مشترک (`ui`, `auth`, `contracts`, `api-client`) با CODEOWNERS و بازبینی تیم پلتفرم مدیریت شوند.
- تغییر در `contracts` نقطه هماهنگی بین فرانت و بک‌اند است؛ تغییرات سازگار با نسخه‌های قبل (افزودن فیلد اختیاری) ترجیح داده می‌شود.
- در مقیاس بزرگ‌تر: افزودن Turborepo/Nx برای cache و اجرای affected، قوانین مرز ماژول (مثل `eslint-plugin-boundaries`) و در صورت نیاز استقرار مستقل هر اپ پشت یک دامنه مشترک.

## محدودیت‌ها و گام‌های بعدی

این موارد آگاهانه در محدوده این تسک انجام نشده‌اند:

- **تست:** هنوز تست خودکاری وجود ندارد. هندلرهای MSW برای تست یکپارچه `AuthProvider` و صفحه‌ها (Vitest + Testing Library) آماده استفاده‌اند.
- **Lint و Typecheck:** پیکربندی ESLint فعلاً فقط `apps/admin` را پوشش می‌دهد و اسکریپت `typecheck` ریشه وجود ندارد؛ پکیج‌ها فقط از طریق اپ‌ها تایپ‌چک می‌شوند. CI هم تنظیم نشده است.
- **امنیت توکن:** توکن در `localStorage` است و Refresh Token وجود ندارد. در محیط واقعی کوکی `HttpOnly` همراه با refresh توصیه می‌شود؛ این کار SSO بین اپ‌ها روی یک دامنه را هم ممکن می‌کند.
- **پیکربندی محیط:** مبنای API (`/api`) در کد ثابت است و باید به متغیر محیطی (`VITE_API_URL`) منتقل شود.
- **تکرار کد بین اپ‌ها:** ساخت HTTP client، `enableMocking` و `main.tsx` بین Admin و Profile تکراری است و می‌تواند در یک تابع bootstrap مشترک یا یک `createApiClient` در `api-client` جمع شود.
- **`ApiError` تکراری:** یک کلاس در `contracts` و یکی در `api-client` تعریف شده است؛ باید تنها یکی بماند.
- **جزئیات و ویرایش کاربر:** صفحه جزئیات و ویرایش کاربر در Admin یک صفحه واحد است. جداسازی آن‌ها (نمایش، سپس ویرایش) ساده است.
- **متن‌ها:** رشته‌های فارسی مستقیماً در کامپوننت‌ها هستند و i18n پیاده‌سازی نشده است.
