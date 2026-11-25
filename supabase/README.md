# Phase 5: Supabase Setup & Administration Guide

This guide covers the database migration, Supabase Dashboard configuration,
environment variables, deployment setup, and administrative commands for
**Phase 5: Authentication & Role-Based Access Control**.

> [!IMPORTANT]
> **Academic Prototype Disclaimer.** NavPC Market is an independent
> Technopreneurship project proposal and is NOT an officially endorsed
> Navotas Polytechnic College platform. No real student data should be
> entered. All demo data exists only in this browser session and is not
> sent to any server unless a Supabase project is explicitly configured.

---

## 1. Institutional Email Domain

The migration restricts registration to emails matching
`@navotaspolytechniccollege.edu.ph`.

> [!NOTE]
> **Domain confirmed usable by students.** The domain
> `navotaspolytechniccollege.edu.ph` has been confirmed as a domain used
> by Navotas Polytechnic College students for institutional email, and
> real Supabase registration and email confirmation using this domain
> have been successfully tested. If the institutional domain ever
> changes, update the `get_allowed_email_domain()` function in
> `supabase/migrations/20261125_phase5_auth_and_roles.sql` before
> re-running the migration.

---

## 2. Running the Database Migration

**File:** `supabase/migrations/20261125_phase5_auth_and_roles.sql`

Run it once in the Supabase SQL Editor — not via `supabase db push` or the
CLI unless you have reviewed it in a staging environment first.

1. Open the **SQL Editor** in your Supabase project dashboard.
2. Click **New Query**.
3. Copy and paste the full contents of the migration file.
4. Click **Run**.

All functions declare `SET search_path = ''` and explicitly qualify references
with `pg_catalog`, `public`, or `auth` to guard against search path manipulation.

---

## 3. Required Supabase Dashboard Settings

### A. Email Provider & Confirmation

1. Navigate to **Authentication → Providers → Email**.
2. **Enable Email provider:** `ON`
3. **Confirm email:** `ON` *(required — users must verify institutional email before logging in)*
4. **Secure email change:** `ON`
5. Save changes.

### B. URL Configuration

Supabase uses the **Site URL** as the destination for confirmation emails and password reset links.

> [!IMPORTANT]
> **Site URL must be exactly one value: your actual production Render URL.**
> Do not set the Site URL to `localhost`. Local development redirect handling is
> provided via the Redirect URLs allowlist below.
> Replace `<your-actual-app-subdomain>` with the actual subdomain assigned by Render.

1. Navigate to **Authentication → URL Configuration**.
2. **Site URL:**
   - One value: `https://<your-actual-app-subdomain>.onrender.com`
3. **Redirect URLs (Allowlist):** add all of the following patterns:
   - `http://localhost:5173/**`
   - `http://localhost:4173/**` (only if Vite preview testing is used)
   - `https://<your-actual-app-subdomain>.onrender.com/**`
4. Save changes.

---

## 4. Environment Variables

Vite embeds environment variables into the static bundle at **build time**.
They must be set before running `npm run build` locally (in `.env`) or
in the hosting platform's environment settings before triggering a build.

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL, e.g. `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase `anon` / public key |
| `VITE_ENABLE_DEMO_MODE` | Optional | Set `true` to enable the demo persona switcher banner when Supabase is not configured. Set `false` (or omit) for production. |

> [!CAUTION]
> Never add `SUPABASE_SERVICE_ROLE_KEY` or any service-role key to a
> `VITE_*` variable. Vite inlines all `VITE_*` variables into the
> client bundle, making them publicly inspectable. The service-role key
> bypasses all Row Level Security — exposing it in frontend code is a
> critical security vulnerability.

Create `.env` from the example:
```bash
cp .env.example .env
# Fill in your real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

`.env` is listed in `.gitignore` and must never be committed to source control.

---

## 5. Render Static Site Deployment

### A. SPA Client-Side Routing (Critical)

Render Static Sites serve pre-built files from `dist/`. Navigating directly to a
client-side route (e.g. `/marketplace`, `/product/123`, `/login`) returns an HTTP 404
unless a rewrite rule is configured in the Render Dashboard.

**Configure Render to rewrite all paths to `/index.html`:**

1. In the Render Dashboard, select your Static Site service.
2. Go to the **Redirects/Rewrites** tab.
3. Add a rewrite rule:

   | Source | Destination | Action |
   |--------|-------------|--------|
   | `/*`   | `/index.html` | **Rewrite** |

4. Click **Save Changes**.

> [!NOTE]
> The file `public/_redirects` uses Netlify/Cloudflare Pages syntax and
> does **not** configure Render. Render requires the dashboard Redirects/Rewrites rule above.

### B. Build Settings (Render Dashboard)

| Setting | Value |
|---|---|
| **Build Command** | `npm run build` |
| **Publish Directory** | `dist` |
| **Node Version** | 18 or 20 |

---

## 6. Role Promotion & SQL Editor Administration Context

All new student registrations default to `role = 'buyer'`. Initial administrator
and seller promotions are managed directly through SQL.

### Understanding the SQL Editor Context

The `prevent_profile_role_update()` trigger checks whether `auth.uid()` is present:

```sql
IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
  RAISE EXCEPTION 'Unauthorized: role changes are restricted to administrators.';
END IF;
```

- When queries execute in the **Supabase SQL Editor**, they run in a trusted direct
  database-administration connection (as the `postgres` role) without an end-user JWT session.
  Therefore, `auth.uid()` evaluates to `NULL`.
- **`auth.uid() IS NULL` does not independently prove administrative identity:** it merely
  reflects the absence of an authenticated user token. The operation is authorized by the
  caller's PostgreSQL database connection privileges.
- In contrast, client API requests sent with an end-user JWT supply a non-null `auth.uid()`
  and are subject to full RLS evaluation and trigger guards.
- **SQL Editor queries bypass RLS entirely** (they run as `postgres`, which is exempt from
  Row Level Security). Running `SELECT`, `INSERT`, or `UPDATE` in the SQL Editor does **not**
  prove that authenticated `buyer` or `seller` sessions are correctly restricted by RLS policies.
  RLS restrictions for authenticated roles must be verified by running actual client API requests
  with a real JWT token.
- This direct database-administration context is distinct from the Supabase API `service_role`
  JWT, which is used for server-side API administration.

### Promotion Commands (Run in Supabase SQL Editor)

#### List All Registered Profiles
```sql
SELECT id, full_name, email, role, created_at
FROM public.profiles
ORDER BY created_at DESC;
```

#### Promote User to Student Seller
```sql
UPDATE public.profiles
SET role = 'seller'
WHERE email = 'student.name@navotaspolytechniccollege.edu.ph';
```

#### Promote User to Platform Administrator
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'faculty.name@navotaspolytechniccollege.edu.ph';
```

#### Demote User Back to Buyer
```sql
UPDATE public.profiles
SET role = 'buyer'
WHERE email = 'student.name@navotaspolytechniccollege.edu.ph';
```

### Inspect Existing RLS Policies (Check for Duplicate Permissive Policies)

Run in the SQL Editor to list all RLS policies on Phase 5 and Phase 6 tables.
If multiple permissive policies exist for the same table, operation, and role, PostgreSQL
combines them with `OR`, which may grant broader access than intended.

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd        AS operation,
  permissive,
  qual       AS using_expr,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'seller_stores', 'products', 'product_images')
ORDER BY tablename, cmd, roles;
```

### Inspect Function Ownership and SECURITY DEFINER Status

Verify that `public.is_seller()`, `public.is_admin()`, and `public.handle_updated_at()`
are owned by a trusted role (typically `postgres`) and carry the `SECURITY DEFINER` attribute.

```sql
SELECT
  n.nspname                             AS schema,
  p.proname                             AS function_name,
  pg_get_userbyid(p.proowner)           AS owner,
  CASE p.prosecdef WHEN true THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security,
  p.proconfig                           AS config
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_seller', 'is_admin', 'handle_updated_at')
ORDER BY p.proname;
```

Expected results:

| function_name | security | config |
|---|---|---|
| `handle_updated_at` | `SECURITY DEFINER` | `{search_path=}` |
| `is_admin` | `SECURITY DEFINER` | `{search_path=}` |
| `is_seller` | `SECURITY DEFINER` | `{search_path=}` |

---

## 7. SQL Email Validation Test Suite (Reference)

The email validation regex pattern:
```sql
'^[^@[:space:]]+@' || replace(allowed_domain, '.', '[.]') || '$'
```
can be tested directly in the Supabase SQL Editor with the following standalone test expressions:

| Test Case | SQL Expression | Expected Result |
|---|---|---|
| **1. Valid institutional email** | `SELECT ('juan.delacruz@navotaspolytechniccollege.edu.ph' ~* ('^[^@[:space:]]+@' \|\| replace('navotaspolytechniccollege.edu.ph', '.', '[.]') \|\| '$'));` | `true` (Accepted) |
| **2. Personal Gmail address** | `SELECT ('juan.delacruz@gmail.com' ~* ('^[^@[:space:]]+@' \|\| replace('navotaspolytechniccollege.edu.ph', '.', '[.]') \|\| '$'));` | `false` (Rejected) |
| **3. Multiple `@` characters** | `SELECT ('juan@delacruz@navotaspolytechniccollege.edu.ph' ~* ('^[^@[:space:]]+@' \|\| replace('navotaspolytechniccollege.edu.ph', '.', '[.]') \|\| '$'));` | `false` (Rejected) |
| **4. Whitespace in address** | `SELECT ('juan delacruz@navotaspolytechniccollege.edu.ph' ~* ('^[^@[:space:]]+@' \|\| replace('navotaspolytechniccollege.edu.ph', '.', '[.]') \|\| '$'));` | `false` (Rejected) |
| **5. NULL email expression behavior** | `SELECT (NULL ~* ('^[^@[:space:]]+@' \|\| replace('navotaspolytechniccollege.edu.ph', '.', '[.]') \|\| '$')) IS NULL;` | `true` (Evaluates to NULL in SQL) |

> [!NOTE]
> The test expressions above verify SQL regular expression and NULL expression behavior only.
> Specifically, Test 5 demonstrates that SQL pattern matching against `NULL` evaluates to `NULL`
> rather than matching. It does not execute the database trigger or prove live registration rejection
> (which is handled in practice by the `IF NEW.email IS NULL` exception guard in `validate_institutional_email()`).
> These standalone checks do NOT represent a claim that live Supabase registration has been tested.
> Live signup and email confirmation require manual verification with real project credentials.

---

## 8. Honest Test-Coverage Record

| Item | Method | Status |
|---|---|---|
| `npm run build` completes with 0 errors | Build output log | ✅ Verified |
| Login page renders | Browser (dev server, no Supabase credentials) | ✅ Verified |
| Register page renders with academic disclaimer | Browser (dev server, no Supabase credentials) | ✅ Verified |
| `/seller` and `/admin` routes blocked when not signed in | Browser (dev server, no Supabase credentials) — `RequireRole` redirects | ✅ Verified (frontend only) |
| Navbar shows correct signed-out state | Browser (dev server, no Supabase credentials) | ✅ Verified |
| Demo mode persona shown when `VITE_ENABLE_DEMO_MODE=true` and no Supabase config | Browser (dev server) | ✅ Verified |
| Real institutional email registration (`@navotaspolytechniccollege.edu.ph`) | Real Supabase project, confirmed by user | ✅ Verified |
| Email confirmation flow | Real Supabase project confirmation email, confirmed by user | ✅ Verified |
| Real Supabase login and persistent session | Real Supabase project, confirmed by user | ✅ Verified |
| Buyer profile auto-created on registration | Real Supabase project — `handle_new_user()` trigger, confirmed by user | ✅ Verified |
| New accounts receive `buyer` role | Real Supabase project, confirmed by user | ✅ Verified |
| Live email domain rejection in database (non-institutional address) | ❌ Not tested separately — only the institutional path was confirmed |
| Role promotion in live database | ❌ Not tested |
| Admin-only route blocked for real `buyer` session | ❌ Not tested with real session — frontend `RequireRole` logic only |
| RLS row isolation with real multi-user sessions | ❌ Not tested |

> [!IMPORTANT]
> Tests verified by the user used real Supabase credentials and a live project. The ✅ rows above
> reflect actual live behavior, not SQL Editor simulation. SQL Editor queries run as the `postgres`
> role with no JWT session; they bypass RLS and the `auth.uid()` trigger guard and are **not**
> sufficient to prove authenticated buyer or seller RLS restrictions.

---

## 9. Security Architecture Summary

- **Anonymous visitors:** Zero access to `public.profiles`. Institutional emails are never exposed.
- **Authenticated buyers and sellers:** Can read and update only their own profile row, limited strictly to the `full_name` column via column-level grant (`GRANT UPDATE (full_name)`). Direct API updates to the `role` column are prohibited at the PostgreSQL privilege level.
- **Authenticated administrators:** Can read all profile rows via the admin RLS policy (`public.is_admin()`), and can update `full_name` on rows permitted by the policy. Authenticated admins **cannot** update the `role` column through the standard Supabase API because the `authenticated` role lacks column-level `UPDATE` permission on `role`.
- **Role promotions & demotions:** Performed exclusively through authorized administrative SQL sessions (such as the Supabase SQL Editor under the `postgres` role). The `prevent_profile_role_update()` trigger provides defense in depth.
- **Phase 6 Public Seller Info:** Implemented via `public.seller_stores`. Exposes only public display information (store name, description, pickup location, contact notes) with no student email field, fully protecting student privacy from anonymous scrapers.

---

## 10. Phase 6: Student Seller Dashboard & Storage Setup

### A. Running the Phase 6 Database Migration

**File:** `supabase/migrations/20261125_phase6_seller_dashboard.sql`

In your Supabase project dashboard:
1. Open the **SQL Editor**.
2. Click **New Query**.
3. Copy and paste the contents of `supabase/migrations/20261125_phase6_seller_dashboard.sql`.
4. Click **Run**.

This migration establishes:
- `public.is_seller()` helper function (hardened with `SET search_path = ''`, granted strictly to `authenticated`).
- `public.seller_stores` table for public merchant profiles without email exposure.
- `public.products` table for catalog listings with stock/price constraints.
- `public.product_images` table with cascade deletion.
- Explicit table-level privileges (`REVOKE ALL FROM PUBLIC`, `GRANT SELECT TO anon`, `GRANT SELECT, INSERT, UPDATE, DELETE TO authenticated`).
- Separate Row Level Security (RLS) policies for `anon` and `authenticated` roles.
- Storage bucket policies for `product-images` enforcing owner folder isolation and active seller role verification.

### B. Supabase Storage Configuration ('product-images')

The migration includes an automated `INSERT INTO storage.buckets` statement, but verify in your dashboard:
1. Navigate to **Storage** > **Buckets**.
2. Confirm the bucket `product-images` exists. If not, click **New Bucket** and configure:
   - **Name:** `product-images`
   - **Public bucket:** `ON` (Checked — enables marketplace visitors to view photos)
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`
   - **Maximum file size:** `5MB`
3. Click **Save bucket**.

Storage files are organized under:
`<seller_uuid>/<product_uuid>/<timestamp>_<filename>`

RLS policies in the migration guarantee that:
- `anon` and `authenticated` have public read access (`SELECT`) to photos in `product-images`.
- Only authenticated sellers can upload (`INSERT`) into their own folder matching `auth.uid()`, checked against `public.is_seller()`.
- Only the folder owner with an active seller role (or an administrator via `public.is_admin()` as an independent authorization branch) can update (`UPDATE` with `USING` + `WITH CHECK`) or delete (`DELETE`) files. Administrators are not restricted to their own folder for moderation purposes.

### C. Manual Student Seller Promotion (Administrative SQL)

Because all student signups receive the `buyer` role by default, promotion to `seller` must be authorized by an administrator in the Supabase SQL Editor:

```sql
-- Promote an existing student account to seller
UPDATE public.profiles
SET role = 'seller'
WHERE email = 'student.name@navotaspolytechniccollege.edu.ph';

-- Verify the promotion
SELECT id, full_name, email, role 
FROM public.profiles 
WHERE role = 'seller';
```

### D. Table Privilege Matrix

| Table | `anon` | `authenticated` | `service_role` | Notes |
|---|---|---|---|---|
| `public.seller_stores` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | `ALL` | `PUBLIC` revoked; RLS filters rows |
| `public.products` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | `ALL` | `PUBLIC` revoked; RLS filters rows |
| `public.product_images` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | `ALL` | `PUBLIC` revoked; RLS filters rows |

### E. Row Level Security (RLS) Policy Matrix

| Table | Operation | Role | Policy Name | Enforcement Criteria |
|---|---|---|---|---|
| `seller_stores` | `SELECT` | `anon` | `Anon can view active seller stores` | `is_active = true` (No `is_admin()` call) |
| `seller_stores` | `SELECT` | `authenticated` | `Authenticated can view seller stores` | `is_active = true OR id = auth.uid() OR public.is_admin()` |
| `seller_stores` | `INSERT` | `authenticated` | `Sellers can create own store` | `id = auth.uid() AND public.is_seller()` |
| `seller_stores` | `UPDATE` | `authenticated` | `Sellers can update own store` | `(id = auth.uid() AND public.is_seller()) OR public.is_admin()` (`USING` + `WITH CHECK`) |
| `seller_stores` | `DELETE` | `authenticated` | `Sellers can delete own store` | `(id = auth.uid() AND public.is_seller()) OR public.is_admin()` |
| `products` | `SELECT` | `anon` | `Anon can view active products` | `is_active = true AND is_archived = false` (No `is_admin()` call) |
| `products` | `SELECT` | `authenticated` | `Authenticated can view visible products` | `(is_active = true AND is_archived = false) OR seller_id = auth.uid() OR public.is_admin()` |
| `products` | `INSERT` | `authenticated` | `Sellers can create products` | `seller_id = auth.uid() AND public.is_seller()` |
| `products` | `UPDATE` | `authenticated` | `Sellers can update own products` | `(seller_id = auth.uid() AND public.is_seller()) OR public.is_admin()` (`USING` + `WITH CHECK`) |
| `products` | `DELETE` | `authenticated` | `Sellers can delete own products` | `(seller_id = auth.uid() AND public.is_seller()) OR public.is_admin()` |
| `product_images` | `SELECT` | `anon` | `Anon can view public product images` | Parent product is active & unarchived (No `is_admin()` call) |
| `product_images` | `SELECT` | `authenticated` | `Authenticated can view visible product images` | Parent product is active, owned by caller, or caller is admin |
| `product_images` | `INSERT` | `authenticated` | `Sellers can insert product images` | Parent product `(seller_id = auth.uid() AND public.is_seller()) OR public.is_admin()` |
| `product_images` | `UPDATE` | `authenticated` | `Sellers can update product images` | Parent product `(seller_id = auth.uid() AND public.is_seller()) OR public.is_admin()` (`USING` + `WITH CHECK`) |
| `product_images` | `DELETE` | `authenticated` | `Sellers can delete product images` | Parent product `(seller_id = auth.uid() AND public.is_seller()) OR public.is_admin()` |

### F. Storage Policy Matrix (`product-images` bucket)

| Operation | Role | Policy Name | Enforcement Criteria |
|---|---|---|---|
| `SELECT` | `anon, authenticated` | `Public can view product images` | `bucket_id = 'product-images'` |
| `INSERT` | `authenticated` | `Sellers can upload to own folder` | `bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text AND public.is_seller()` |
| `UPDATE` | `authenticated` | `Sellers can update files in own folder` | `bucket_id = 'product-images' AND (((storage.foldername(name))[1] = auth.uid()::text AND public.is_seller()) OR public.is_admin())` (`USING` + `WITH CHECK`) |
| `DELETE` | `authenticated` | `Sellers can delete files in own folder` | `bucket_id = 'product-images' AND (((storage.foldername(name))[1] = auth.uid()::text AND public.is_seller()) OR public.is_admin())` |

### G. Phase 6 RLS Test Verification Matrix

| Test Case | Scenario / Query | Expected Result |
|---|---|---|
| **1. Buyer creating product** | Logged in as `buyer`, attempt `INSERT INTO public.products ...` | **REJECTED** (violates `public.is_seller()` in RLS `WITH CHECK`) |
| **2. Seller creating own product** | Logged in as `seller`, `INSERT INTO public.products (seller_id, ...) VALUES (auth.uid(), ...)` | **PERMITTED** |
| **3. Seller spoofing seller_id** | Logged in as `seller`, attempt `INSERT ... VALUES ('another-seller-uuid', ...)` | **REJECTED** (`seller_id = auth.uid()` violation) |
| **4. Seller updating another seller's stock** | Logged in as `seller A`, attempt `UPDATE public.products SET stock = 99 WHERE seller_id = 'seller-B'` | **REJECTED** (0 rows affected / RLS blocked) |
| **5. Demoted seller updating stock** | Former seller demoted to `buyer` attempts `UPDATE public.products ...` | **REJECTED** (violates `public.is_seller()` in `USING` + `WITH CHECK`) |
| **6. Anonymous marketplace viewing** | Unauthenticated `SELECT * FROM public.products WHERE is_active = true` | **PERMITTED** (active, non-archived listings only; executes without calling `is_admin()`) |
| **7. Anonymous viewing seller emails** | Unauthenticated `SELECT email FROM public.profiles` | **REJECTED** (zero access to `profiles` for anon) |
| **8. Cross-seller file deletion** | Seller A attempting to delete `/storage/v1/object/product-images/seller-B/...` | **REJECTED** by storage RLS policy (`auth.uid()` does not match path) |
| **9. Demoted seller uploading storage file** | Former seller demoted to `buyer` attempts upload | **REJECTED** (violates `public.is_seller()` in storage policy) |
| **10. Administrator image moderation** | Logged in as `admin`, attempt `DELETE FROM storage.objects WHERE bucket_id = 'product-images' AND name = 'seller-B/prod-1/photo.jpg'` | **PERMITTED** (independent `public.is_admin()` branch allows cross-folder moderation) |
