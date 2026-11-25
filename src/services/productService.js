/**
 * NavPC Market — Product & Inventory Management Service
 * 
 * Provides database operations for student sellers via Supabase PostgreSQL & Storage,
 * with seamless graceful fallback to localStorage when running in demo mode.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ALL_PRODUCTS } from '../utils/demoData';

const LOCAL_STORAGE_SELLER_PRODUCTS_PREFIX = 'navpc_seller_products_';
const LOCAL_STORAGE_STORE_PREFIX = 'navpc_seller_store_';

// Initial demo products for demo-seller-001
const DEFAULT_DEMO_SELLER_PRODUCTS = ALL_PRODUCTS.filter(
  (p) => p.seller?.name === 'Maria Santos' || p.id === 'prod-001' || p.id === 'prod-006' || p.id === 'prod-012'
).map((p) => ({
  id: p.id,
  seller_id: 'demo-seller-001',
  title: p.title,
  description: p.description,
  category: p.category,
  price: p.price,
  stock: p.stock,
  condition: p.condition,
  pickup_arrangement: p.meetupLocation || 'NPC Main Building Lobby (Proposed Zone)',
  tags: [p.categorySlug || 'general'],
  is_active: true,
  is_archived: false,
  created_at: p.createdAt || new Date().toISOString(),
  updated_at: new Date().toISOString(),
  product_images: p.image ? [{ id: `img-${p.id}`, public_url: p.image, display_order: 0 }] : [],
}));

export const productService = {
  /**
   * Fetch all products belonging to the authenticated seller
   */
  async getSellerProducts(sellerId) {
    if (!sellerId) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (
              id,
              storage_path,
              public_url,
              display_order
            )
          `)
          .eq('seller_id', sellerId)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching seller products from Supabase:', error.message);
          throw error;
        }

        return data || [];
      } catch (err) {
        console.warn('Falling back to local seller products:', err.message);
      }
    }

    // Local / Demo Mode Fallback
    try {
      const key = `${LOCAL_STORAGE_SELLER_PRODUCTS_PREFIX}${sellerId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default demo products for demo seller
      localStorage.setItem(key, JSON.stringify(DEFAULT_DEMO_SELLER_PRODUCTS));
      return DEFAULT_DEMO_SELLER_PRODUCTS;
    } catch (e) {
      console.error('Local storage product read error:', e);
      return [];
    }
  },

  /**
   * Create a new product listing with optional image uploads to Supabase Storage
   */
  async createProduct({ sellerId, title, description, category, price, stock, condition, pickupArrangement, tags = [] }, imageFiles = []) {
    if (!sellerId) throw new Error('Seller ID is required');
    if (!title?.trim()) throw new Error('Product title is required');
    if (!description?.trim()) throw new Error('Product description is required');
    if (!category) throw new Error('Category is required');
    if (price <= 0 || isNaN(price)) throw new Error('Price must be greater than zero');
    if (stock < 0 || isNaN(stock)) throw new Error('Stock cannot be negative');
    if (!condition) throw new Error('Product condition is required');

    const cleanPrice = parseFloat(price);
    const cleanStock = parseInt(stock, 10);

    if (isSupabaseConfigured && supabase) {
      // 1. Insert product record
      const { data: newProduct, error: prodError } = await supabase
        .from('products')
        .insert({
          seller_id: sellerId,
          title: title.trim(),
          description: description.trim(),
          category,
          price: cleanPrice,
          stock: cleanStock,
          condition,
          pickup_arrangement: pickupArrangement || 'NPC Main Building Lobby (Proposed Zone)',
          tags,
          is_active: cleanStock > 0,
          is_archived: false,
        })
        .select()
        .single();

      if (prodError) {
        console.error('Supabase product insert error:', prodError.message);
        throw prodError;
      }

      // 2. Upload images if provided
      const uploadedImages = [];
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          try {
            const ext = file.name.split('.').pop().toLowerCase();
            const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
            const storagePath = `${sellerId}/${newProduct.id}/${safeName}`;

            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              console.warn('Storage upload error for file:', file.name, uploadError.message);
              continue;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(storagePath);

            // Record image in public.product_images
            const { data: imgRecord } = await supabase
              .from('product_images')
              .insert({
                product_id: newProduct.id,
                storage_path: storagePath,
                public_url: publicUrl,
                display_order: i,
              })
              .select()
              .single();

            if (imgRecord) uploadedImages.push(imgRecord);
          } catch (uploadErr) {
            console.error('Failed uploading image:', uploadErr);
          }
        }
      }

      return {
        ...newProduct,
        product_images: uploadedImages,
      };
    }

    // Demo Mode: store in localStorage
    const key = `${LOCAL_STORAGE_SELLER_PRODUCTS_PREFIX}${sellerId}`;
    const products = await this.getSellerProducts(sellerId);

    const mockImages = [];
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        mockImages.push({
          id: `demo-img-${Date.now()}-${i}`,
          public_url: URL.createObjectURL(file),
          display_order: i,
        });
      }
    }

    const newLocalProduct = {
      id: `local-prod-${Date.now()}`,
      seller_id: sellerId,
      title: title.trim(),
      description: description.trim(),
      category,
      price: cleanPrice,
      stock: cleanStock,
      condition,
      pickup_arrangement: pickupArrangement || 'NPC Main Building Lobby (Proposed Zone)',
      tags,
      is_active: cleanStock > 0,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product_images: mockImages,
    };

    const updated = [newLocalProduct, ...products];
    localStorage.setItem(key, JSON.stringify(updated));
    return newLocalProduct;
  },

  /**
   * Update an existing product
   */
  async updateProduct(productId, sellerId, updates, newImageFiles = [], removedImageIds = []) {
    if (!productId || !sellerId) throw new Error('Product ID and Seller ID are required');

    if (updates.price !== undefined && (parseFloat(updates.price) <= 0 || isNaN(parseFloat(updates.price)))) {
      throw new Error('Price must be greater than zero');
    }
    if (updates.stock !== undefined && (parseInt(updates.stock, 10) < 0 || isNaN(parseInt(updates.stock, 10)))) {
      throw new Error('Stock cannot be negative');
    }

    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.stock !== undefined) {
      payload.stock = parseInt(updates.stock, 10);
      if (payload.stock === 0) {
        payload.is_active = false;
      }
    }

    if (updates.price !== undefined) {
      payload.price = parseFloat(updates.price);
    }

    if (isSupabaseConfigured && supabase) {
      const { data: updatedProd, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId)
        .eq('seller_id', sellerId)
        .select()
        .single();

      if (error) {
        console.error('Error updating product in Supabase:', error.message);
        throw error;
      }

      // Remove designated images
      if (removedImageIds && removedImageIds.length > 0) {
        for (const imgId of removedImageIds) {
          const { data: img } = await supabase
            .from('product_images')
            .select('storage_path')
            .eq('id', imgId)
            .single();

          if (img?.storage_path) {
            await supabase.storage.from('product-images').remove([img.storage_path]);
          }
          await supabase.from('product_images').delete().eq('id', imgId);
        }
      }

      // Upload new images
      if (newImageFiles && newImageFiles.length > 0) {
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const ext = file.name.split('.').pop().toLowerCase();
          const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
          const storagePath = `${sellerId}/${productId}/${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(storagePath, file, { cacheControl: '3600', upsert: false });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(storagePath);

            await supabase.from('product_images').insert({
              product_id: productId,
              storage_path: storagePath,
              public_url: publicUrl,
              display_order: 10 + i,
            });
          }
        }
      }

      return updatedProd;
    }

    // Local / Demo Mode update
    const key = `${LOCAL_STORAGE_SELLER_PRODUCTS_PREFIX}${sellerId}`;
    const products = await this.getSellerProducts(sellerId);
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) throw new Error('Product not found');

    let currentImages = products[index].product_images || [];
    if (removedImageIds && removedImageIds.length > 0) {
      currentImages = currentImages.filter((img) => !removedImageIds.includes(img.id));
    }
    if (newImageFiles && newImageFiles.length > 0) {
      newImageFiles.forEach((file, idx) => {
        currentImages.push({
          id: `demo-img-new-${Date.now()}-${idx}`,
          public_url: URL.createObjectURL(file),
          display_order: currentImages.length + idx,
        });
      });
    }

    const updatedItem = {
      ...products[index],
      ...payload,
      product_images: currentImages,
    };

    products[index] = updatedItem;
    localStorage.setItem(key, JSON.stringify(products));
    return updatedItem;
  },

  /**
   * Delete a product listing and clean up storage
   */
  async deleteProduct(productId, sellerId) {
    if (!productId || !sellerId) throw new Error('Product ID and Seller ID are required');

    if (isSupabaseConfigured && supabase) {
      // 1. Get associated images to remove from storage
      const { data: images } = await supabase
        .from('product_images')
        .select('storage_path')
        .eq('product_id', productId);

      if (images && images.length > 0) {
        const paths = images.map((img) => img.storage_path).filter(Boolean);
        if (paths.length > 0) {
          await supabase.storage.from('product-images').remove(paths);
        }
      }

      // 2. Delete product record (product_images cascades in postgres)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', sellerId);

      if (error) {
        console.error('Error deleting product from Supabase:', error.message);
        throw error;
      }
      return true;
    }

    // Local Mode
    const key = `${LOCAL_STORAGE_SELLER_PRODUCTS_PREFIX}${sellerId}`;
    const products = await this.getSellerProducts(sellerId);
    const filtered = products.filter((p) => p.id !== productId);
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  },

  /**
   * Quick update for inventory stock
   */
  async updateStock(productId, sellerId, newStock) {
    const stockVal = parseInt(newStock, 10);
    if (isNaN(stockVal) || stockVal < 0) {
      throw new Error('Stock cannot be negative');
    }
    return this.updateProduct(productId, sellerId, { stock: stockVal });
  },

  /**
   * Fetch public listings from Supabase to integrate into marketplace discovery
   */
  async getPublicProducts() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (
              id,
              public_url,
              display_order
            ),
            seller_stores (
              store_name,
              pickup_location
            )
          `)
          .eq('is_active', true)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching public products from Supabase:', error.message);
          return [];
        }

        return (data || []).map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          categorySlug: p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          price: parseFloat(p.price),
          condition: p.condition,
          stock: p.stock,
          seller: {
            name: p.seller_stores?.store_name || 'NPC Student Seller',
            program: 'Enrolled NPC Student',
            rating: null, // No fake ratings for real student listings
            salesCount: null,
            avatar: null,
          },
          image: p.product_images?.[0]?.public_url || null,
          images: p.product_images?.map((img) => img.public_url) || [],
          description: p.description,
          meetupLocation: p.pickup_arrangement,
          isLive: true,
          isDemo: false,
          createdAt: p.created_at,
        }));
      } catch (err) {
        console.warn('Public product query failed:', err.message);
        return [];
      }
    }
    return [];
  },

  /**
   * Get store profile for a seller
   */
  async getSellerStore(sellerId) {
    if (!sellerId) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('seller_stores')
          .select('*')
          .eq('id', sellerId)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Error fetching store settings:', err.message);
      }
    }

    // Local / Demo Store
    const key = `${LOCAL_STORAGE_STORE_PREFIX}${sellerId}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);

    const defaultStore = {
      id: sellerId,
      store_name: "Maria's NPC Campus Hub",
      description: 'Pre-loved books, school supplies, and study essentials for NPC students.',
      pickup_location: 'Student Activity Center (SAC) (Proposed Zone)',
      contact_note: 'Available weekdays between 1:00 PM and 5:00 PM.',
      is_active: true,
    };
    localStorage.setItem(key, JSON.stringify(defaultStore));
    return defaultStore;
  },

  /**
   * Update store profile for a seller
   */
  async updateSellerStore(sellerId, storeData) {
    if (!sellerId) throw new Error('Seller ID is required');

    const payload = {
      ...storeData,
      id: sellerId,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('seller_stores')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error saving store profile in Supabase:', error.message);
        throw error;
      }
      return data;
    }

    // Local storage update
    const key = `${LOCAL_STORAGE_STORE_PREFIX}${sellerId}`;
    localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  },
};
