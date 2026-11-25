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

## 1. Domain Verification Required

The migration restricts registration to emails matching
`@navotaspolytechniccollege.edu.ph`.

> [!WARNING]
> **Verify this domain before running the migration in a live Supabase
> project.** The domain `navotaspolytechniccollege.edu.ph` has not been
> confirmed as the actual operational email domain of Navotas Polytechnic
> College. If the real institutional domain differs, update the
> `get_allowed_email_domain()` function in the migration file before
> executing it.

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
- In contrast, client API requests sent with an end-user JWT supply a non-null `auth.uid()`.
  If that user does not have `role = 'admin'` according to `public.is_admin()`, the trigger
  blocks the update.
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
| Real Supabase signup with email confirmation | ❌ Not tested — no live Supabase credentials configured locally |
| Real Supabase login and persistent session | ❌ Not tested |
| Live email domain rejection in database | ❌ Not tested |
| Role promotion in live database | ❌ Not tested |
| Admin-only route blocked for real `buyer` session | ❌ Not tested |
| RLS row isolation with real multi-user sessions | ❌ Not tested |

---

## 9. Security Architecture Summary

- **Anonymous visitors:** Zero access to `public.profiles`. Institutional emails are never exposed.
- **Authenticated buyers and sellers:** Can read and update only their own profile row, limited strictly to the `full_name` column via column-level grant (`GRANT UPDATE (full_name)`). Direct API updates to the `role` column are prohibited at the PostgreSQL privilege level.
- **Authenticated administrators:** Can read all profile rows via the admin RLS policy (`public.is_admin()`), and can update `full_name` on rows permitted by the policy. Authenticated admins **cannot** update the `role` column through the standard Supabase API because the `authenticated` role lacks column-level `UPDATE` permission on `role`.
- **Role promotions & demotions:** Performed exclusively through authorized administrative SQL sessions (such as the Supabase SQL Editor under the `postgres` role). The `prevent_profile_role_update()` trigger provides defense in depth.
- **Phase 6 Public Seller Info:** Future seller profiles will use a separate `seller_stores` table containing only public display information (store name, description, ratings) with no email field.
