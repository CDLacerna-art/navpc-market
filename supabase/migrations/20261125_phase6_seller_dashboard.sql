-- ==============================================================================
-- NavPC Market — Phase 6: Student Seller Dashboard & Product Catalog Migration
-- ==============================================================================
-- NOTICE:
-- Execute this migration directly in the Supabase SQL Editor.
-- This script adds:
--   1. public.is_seller() helper function (SECURITY DEFINER, hardened search path)
--   2. public.seller_stores table (store profiles, table privileges, separate anon/auth RLS)
--   3. public.products table (catalog listings, table privileges, separate anon/auth RLS)
--   4. public.product_images table (gallery photos, table privileges, separate anon/auth RLS)
--   5. updated_at triggers with hardened search path
--   6. Supabase Storage bucket setup & hardened folder isolation policies
--
-- SECURITY ARCHITECTURE:
--   - Anonymous users have strictly separated SELECT policies that NEVER call
--     public.is_admin() or authenticated-only helpers.
--   - Every seller mutation (INSERT, UPDATE, DELETE) requires both row ownership
--     (auth.uid()) AND active seller status (public.is_seller()), preventing revoked
--     sellers from mutating existing products or stores.
--   - Explicit table-level privileges (GRANT/REVOKE) are defined for anon,
--     authenticated, and service_role.
-- ==============================================================================


-- =============================================================================
-- SECTION 1 — Helper function: public.is_seller()
-- =============================================================================
-- Evaluates whether the calling JWT session belongs to a profile with role
-- 'seller' or 'admin'. Uses SET search_path = '' for security hardening.

CREATE OR REPLACE FUNCTION public.is_seller()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('seller', 'admin')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_seller() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_seller() TO authenticated;


-- =============================================================================
-- SECTION 2 — Table: public.seller_stores
-- =============================================================================
-- Public store profile for student sellers.
-- Stores display information (store name, bio/description, preferred meetup zone)
-- WITHOUT exposing the student's institutional email address to anonymous visitors.

CREATE TABLE IF NOT EXISTS public.seller_stores (
  id                  uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name          text NOT NULL,
  description         text DEFAULT '',
  pickup_location     text NOT NULL DEFAULT 'NPC Main Building Lobby (Proposed Zone)',
  contact_note        text DEFAULT '',
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Index for active store lookup
CREATE INDEX IF NOT EXISTS idx_seller_stores_active ON public.seller_stores(is_active);

-- -----------------------------------------------------------------------------
-- Explicit Table Privileges: public.seller_stores
-- -----------------------------------------------------------------------------
REVOKE ALL ON public.seller_stores FROM PUBLIC;
REVOKE ALL ON public.seller_stores FROM anon;
REVOKE ALL ON public.seller_stores FROM authenticated;

-- Anonymous users may only SELECT (filtered by RLS)
GRANT SELECT ON public.seller_stores TO anon;

-- Authenticated users receive standard DML privileges (filtered by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seller_stores TO authenticated;

-- Service role retains full administrative privileges
GRANT ALL ON public.seller_stores TO service_role;

-- -----------------------------------------------------------------------------
-- Row Level Security: public.seller_stores
-- -----------------------------------------------------------------------------
ALTER TABLE public.seller_stores ENABLE ROW LEVEL SECURITY;

-- Clean up any previous policy variants
DROP POLICY IF EXISTS "Public can view active seller stores" ON public.seller_stores;
DROP POLICY IF EXISTS "Sellers can view own store" ON public.seller_stores;

-- Policy 1: Anonymous users can view only active seller stores (NO is_admin() call)
DROP POLICY IF EXISTS "Anon can view active seller stores" ON public.seller_stores;
CREATE POLICY "Anon can view active seller stores"
  ON public.seller_stores
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policy 2: Authenticated users can view active stores, their own store, or all if admin
DROP POLICY IF EXISTS "Authenticated can view seller stores" ON public.seller_stores;
CREATE POLICY "Authenticated can view seller stores"
  ON public.seller_stores
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR id = auth.uid()
    OR public.is_admin()
  );

-- Policy 3: Only verified sellers can insert their own store
DROP POLICY IF EXISTS "Sellers can create own store" ON public.seller_stores;
CREATE POLICY "Sellers can create own store"
  ON public.seller_stores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND public.is_seller()
  );

-- Policy 4: Sellers can update only their own store, requiring active seller role
DROP POLICY IF EXISTS "Sellers can update own store" ON public.seller_stores;
CREATE POLICY "Sellers can update own store"
  ON public.seller_stores
  FOR UPDATE
  TO authenticated
  USING (
    (id = auth.uid() AND public.is_seller())
    OR public.is_admin()
  )
  WITH CHECK (
    (id = auth.uid() AND public.is_seller())
    OR public.is_admin()
  );

-- Policy 5: Sellers can delete only their own store, requiring active seller role
DROP POLICY IF EXISTS "Sellers can delete own store" ON public.seller_stores;
CREATE POLICY "Sellers can delete own store"
  ON public.seller_stores
  FOR DELETE
  TO authenticated
  USING (
    (id = auth.uid() AND public.is_seller())
    OR public.is_admin()
  );


-- =============================================================================
-- SECTION 3 — Table: public.products
-- =============================================================================
-- Core product catalog listings created and managed by student sellers.
-- Includes price/stock validation and ownership integrity via seller_id.

CREATE TABLE IF NOT EXISTS public.products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title               text NOT NULL,
  description         text NOT NULL,
  category            text NOT NULL,
  price               numeric(10, 2) NOT NULL CHECK (price > 0),
  stock               integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  condition           text NOT NULL CHECK (condition IN ('Brand New', 'Like New', 'Pre-loved', 'Digital / Service')),
  pickup_arrangement  text NOT NULL DEFAULT 'NPC Main Building Lobby (Proposed Zone)',
  tags                text[] NOT NULL DEFAULT '{}',
  is_active           boolean NOT NULL DEFAULT true,
  is_archived         boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast marketplace discovery and seller filtering
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(is_active, is_archived);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- -----------------------------------------------------------------------------
-- Explicit Table Privileges: public.products
-- -----------------------------------------------------------------------------
REVOKE ALL ON public.products FROM PUBLIC;
REVOKE ALL ON public.products FROM anon;
REVOKE ALL ON public.products FROM authenticated;

-- Anonymous users may only SELECT (filtered by RLS)
GRANT SELECT ON public.products TO anon;

-- Authenticated users receive standard DML privileges (filtered by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- Service role retains full administrative privileges
GRANT ALL ON public.products TO service_role;

-- -----------------------------------------------------------------------------
-- Row Level Security: public.products
-- -----------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Clean up any previous policy variants
DROP POLICY IF EXISTS "Public can view active products" ON public.products;

-- Policy A1: Anonymous users can view only active, non-archived products (NO is_admin() call)
DROP POLICY IF EXISTS "Anon can view active products" ON public.products;
CREATE POLICY "Anon can view active products"
  ON public.products
  FOR SELECT
  TO anon
  USING (
    is_active = true
    AND is_archived = false
  );

-- Policy A2: Authenticated users can view active products, their own products, or all if admin
DROP POLICY IF EXISTS "Authenticated can view visible products" ON public.products;
CREATE POLICY "Authenticated can view visible products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (
    (is_active = true AND is_archived = false)
    OR seller_id = auth.uid()
    OR public.is_admin()
  );

-- Policy B: Only verified sellers can insert products owned by themselves
DROP POLICY IF EXISTS "Sellers can create products" ON public.products;
CREATE POLICY "Sellers can create products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id = auth.uid()
    AND public.is_seller()
  );

-- Policy C: Sellers can update only their own products, requiring active seller role
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
CREATE POLICY "Sellers can update own products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    (seller_id = auth.uid() AND public.is_seller())
    OR public.is_admin()
  )
  WITH CHECK (
    (seller_id = auth.uid() AND public.is_seller())
    OR public.is_admin()
  );

-- Policy D: Sellers can delete only their own products, requiring active seller role
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
CREATE POLICY "Sellers can delete own products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (
    (seller_id = auth.uid() AND public.is_seller())
    OR public.is_admin()
  );


-- =============================================================================
-- SECTION 4 — Table: public.product_images
-- =============================================================================
-- Stores public image references uploaded to Supabase Storage.
-- Links images directly to a product, with display ordering and cascade deletion.

CREATE TABLE IF NOT EXISTS public.product_images (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path        text NOT NULL,
  public_url          text NOT NULL,
  display_order       integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Index for ordering product gallery images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id, display_order ASC);

-- -----------------------------------------------------------------------------
-- Explicit Table Privileges: public.product_images
-- -----------------------------------------------------------------------------
REVOKE ALL ON public.product_images FROM PUBLIC;
REVOKE ALL ON public.product_images FROM anon;
REVOKE ALL ON public.product_images FROM authenticated;

-- Anonymous users may only SELECT (filtered by RLS)
GRANT SELECT ON public.product_images TO anon;

-- Authenticated users receive standard DML privileges (filtered by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;

-- Service role retains full administrative privileges
GRANT ALL ON public.product_images TO service_role;

-- -----------------------------------------------------------------------------
-- Row Level Security: public.product_images
-- -----------------------------------------------------------------------------
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Clean up any previous policy variants
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;

-- Policy A1: Anonymous users can view images of publicly visible products only (NO is_admin() call)
DROP POLICY IF EXISTS "Anon can view public product images" ON public.product_images;
CREATE POLICY "Anon can view public product images"
  ON public.product_images
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND p.is_active = true
        AND p.is_archived = false
    )
  );

-- Policy A2: Authenticated users can view visible product images
DROP POLICY IF EXISTS "Authenticated can view visible product images" ON public.product_images;
CREATE POLICY "Authenticated can view visible product images"
  ON public.product_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND (
          (p.is_active = true AND p.is_archived = false)
          OR p.seller_id = auth.uid()
          OR public.is_admin()
        )
    )
  );

-- Policy B: Only the active seller who owns the parent product can insert images
DROP POLICY IF EXISTS "Sellers can insert product images" ON public.product_images;
CREATE POLICY "Sellers can insert product images"
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND (
          (p.seller_id = auth.uid() AND public.is_seller())
          OR public.is_admin()
        )
    )
  );

-- Policy C: Only the active seller who owns the parent product can update images
DROP POLICY IF EXISTS "Sellers can update product images" ON public.product_images;
CREATE POLICY "Sellers can update product images"
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND (
          (p.seller_id = auth.uid() AND public.is_seller())
          OR public.is_admin()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND (
          (p.seller_id = auth.uid() AND public.is_seller())
          OR public.is_admin()
        )
    )
  );

-- Policy D: Only the active seller who owns the parent product can delete images
DROP POLICY IF EXISTS "Sellers can delete product images" ON public.product_images;
CREATE POLICY "Sellers can delete product images"
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND (
          (p.seller_id = auth.uid() AND public.is_seller())
          OR public.is_admin()
        )
    )
  );


-- =============================================================================
-- SECTION 5 — Triggers for updated_at timestamps
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC;

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_seller_stores_updated_at ON public.seller_stores;
CREATE TRIGGER tr_seller_stores_updated_at
  BEFORE UPDATE ON public.seller_stores
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- =============================================================================
-- SECTION 6 — Supabase Storage: 'product-images' Bucket Configuration
-- =============================================================================
-- In your Supabase Dashboard:
-- 1. Go to Storage > New Bucket
-- 2. Name: 'product-images'
-- 3. Public bucket: ON (allows buyers and visitors to view product photos)
-- 4. Allowed MIME types: image/jpeg, image/png, image/webp
-- 5. File size limit: 5MB (5242880 bytes)
--
-- Objects are organized as:
--   "<seller_uuid>/<product_uuid>/<filename>"
-- (storage.foldername(name))[1] matches the seller's auth.uid().
-- Both path ownership and current seller authorization (public.is_seller())
-- are strictly enforced on all seller file mutations. Administrators can moderate
-- (UPDATE/DELETE) across folders via public.is_admin().
-- =============================================================================

-- Attempt bucket creation if storage schema is accessible
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policy 1: Public read access for product images
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Storage Policy 2: Authenticated sellers can upload into their own folder only
DROP POLICY IF EXISTS "Sellers can upload to own folder" ON storage.objects;
CREATE POLICY "Sellers can upload to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_seller()
  );

-- Storage Policy 3: Sellers can update files in their own folder; admins can moderate all folders (USING + WITH CHECK)
DROP POLICY IF EXISTS "Sellers can update files in own folder" ON storage.objects;
CREATE POLICY "Sellers can update files in own folder"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (
      ((storage.foldername(name))[1] = auth.uid()::text AND public.is_seller())
      OR public.is_admin()
    )
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND (
      ((storage.foldername(name))[1] = auth.uid()::text AND public.is_seller())
      OR public.is_admin()
    )
  );

-- Storage Policy 4: Sellers can delete files in their own folder; admins can moderate all folders
DROP POLICY IF EXISTS "Sellers can delete files in own folder" ON storage.objects;
CREATE POLICY "Sellers can delete files in own folder"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (
      ((storage.foldername(name))[1] = auth.uid()::text AND public.is_seller())
      OR public.is_admin()
    )
  );
