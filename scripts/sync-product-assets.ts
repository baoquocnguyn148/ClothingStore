import { createClient } from '@supabase/supabase-js';
import { resolveProductImages } from '../lib/commerce/product-images';

interface ProductAssetConfig {
  handle: string;
  title: string;
  category: string;
  colorName: string;
  colorHex: string;
}

const productAssetConfigs: ProductAssetConfig[] = [
  {
    handle: 'khaki-harrington-jacket',
    title: 'Chino Harrington Jacket',
    category: 'jacket',
    colorName: 'Khaki',
    colorHex: '#c8b68b',
  },
  {
    handle: 'oxford-button-down-blue',
    title: 'Oxford Button-Down Shirt',
    category: 'shirt',
    colorName: 'Black',
    colorHex: '#10131a',
  },
  {
    handle: 'cable-knit-sweater-cream',
    title: 'Cable-Knit Cotton Sweater',
    category: 'sweater',
    colorName: 'Navy',
    colorHex: '#080b3f',
  },
  {
    handle: 'navy-classic-polo',
    title: 'Classic Fit Mesh Polo Shirt',
    category: 'polo',
    colorName: 'White',
    colorHex: '#f7f5f0',
  },
  {
    handle: 'levents-travel-cities-long-sleeve-boxy-tee',
    title: 'KHAKI JACKET',
    category: 'jacket',
    colorName: 'Khaki',
    colorHex: '#c8b68b',
  },
  {
    handle: 'ao-so-mi',
    title: 'Luxury Oxford T-shirt',
    category: 'shirt',
    colorName: 'Black',
    colorHex: '#10131a',
  },
  {
    handle: 'ao-len-basic',
    title: 'Cable Sweater',
    category: 'sweater',
    colorName: 'Navy',
    colorHex: '#080b3f',
  },
  {
    handle: 'polo-navy',
    title: 'Luxury Navy Polo',
    category: 'polo',
    colorName: 'Navy',
    colorHex: '#1e3a8a',
  },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function syncProductAssets() {
  for (const config of productAssetConfigs) {
    const { data: product, error: productError } = await db
      .from('products')
      .select('id, title, product_images(url, sort_order)')
      .eq('handle', config.handle)
      .is('deleted_at', null)
      .single();

    if (productError || !product) {
      console.warn(`Skipped ${config.handle}: product not found`);
      continue;
    }

    const currentImages = (product.product_images ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((image: { url: string }) => image.url);
    const images = resolveProductImages({
      title: config.title,
      handle: config.handle,
      images: currentImages,
    });

    await db
      .from('products')
      .update({
        title: config.title,
        category: config.category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id);

    await db.from('product_images').delete().eq('product_id', product.id);
    if (images.length) {
      const { error: imageError } = await db.from('product_images').insert(
        images.map((url, index) => ({
          product_id: product.id,
          url,
          alt: config.title,
          sort_order: index,
        }))
      );
      if (imageError) throw imageError;
    }

    const { error: variantError } = await db
      .from('product_variants')
      .update({
        color_name: config.colorName,
        color_hex: config.colorHex,
      })
      .eq('product_id', product.id);

    if (variantError) throw variantError;

    console.log(`Synced ${config.handle}: ${images.length} image(s), ${config.colorName}`);
  }
}

syncProductAssets().catch((error) => {
  console.error(error);
  process.exit(1);
});
