/**
 * Run: npx tsx scripts/seed-supabase.ts
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from '@supabase/supabase-js';
import { mockProducts } from '../data/mock/products';
import { mockCollections } from '../data/mock/collections';
import { mockBlogPosts } from '../data/mock/blog';
import { mockPolicies } from '../data/mock/policies';
import { HOME_CONTENT_DEFAULTS } from '../lib/home-content/defaults';
import { resolveProductImages } from '../lib/commerce/product-images';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  const tagSlugs = ['new', 'best-seller', 'sale', 'sold-out'];
  for (const slug of tagSlugs) {
    await supabase.from('tags').upsert({ slug, label: slug }, { onConflict: 'slug' });
  }
  const { data: tags } = await supabase.from('tags').select('id, slug');
  const tagMap = Object.fromEntries((tags ?? []).map((t) => [t.slug, t.id]));

  for (const col of mockCollections) {
    const { data: c } = await supabase
      .from('collections')
      .upsert(
        {
          handle: col.handle,
          title: col.title,
          description: col.description ?? null,
          published: true,
        },
        { onConflict: 'handle' }
      )
      .select('id')
      .single();
    if (!c) continue;

    for (const handle of col.productHandles) {
      const { data: p } = await supabase
        .from('products')
        .select('id')
        .eq('handle', handle)
        .single();
      if (p) {
        await supabase.from('collection_products').upsert(
          { collection_id: c.id, product_id: p.id, sort_order: 0 },
          { onConflict: 'collection_id,product_id' }
        );
      }
    }
  }

  for (const product of mockProducts) {
    const { data: p } = await supabase
      .from('products')
      .upsert(
        {
          handle: product.handle,
          title: product.title,
          description: product.description,
          base_price: product.price,
          compare_at_price: product.compareAtPrice ?? null,
          category: product.category,
          published: true,
        },
        { onConflict: 'handle' }
      )
      .select('id')
      .single();

    if (!p) continue;

    const images = resolveProductImages({
      title: product.title,
      handle: product.handle,
      images: product.images,
    });

    await supabase.from('product_images').delete().eq('product_id', p.id);
    for (let i = 0; i < images.length; i++) {
      await supabase.from('product_images').insert({
        product_id: p.id,
        url: images[i],
        alt: product.title,
        sort_order: i,
      });
    }

    for (const v of product.variants) {
      await supabase.from('product_variants').upsert(
        {
          product_id: p.id,
          sku: v.id,
          size: v.size,
          color_name: v.color,
          color_hex: v.colorHex,
          price: v.price,
          stock_qty: v.available ? 50 : 0,
          is_active: v.available,
        },
        { onConflict: 'sku' }
      );
    }

    for (const tag of product.tags) {
      const tagId = tagMap[tag];
      if (tagId) {
        await supabase.from('product_tag_assignments').upsert(
          { product_id: p.id, tag_id: tagId },
          { onConflict: 'product_id,tag_id' }
        );
      }
    }

    for (const colHandle of product.collectionHandles) {
      const { data: col } = await supabase
        .from('collections')
        .select('id')
        .eq('handle', colHandle)
        .single();
      if (col) {
        await supabase.from('collection_products').upsert(
          { collection_id: col.id, product_id: p.id, sort_order: 0 },
          { onConflict: 'collection_id,product_id' }
        );
      }
    }
  }

  for (const post of mockBlogPosts) {
    const { data: bp } = await supabase
      .from('blog_posts')
      .upsert(
        {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          image_url: post.image,
          published_at: post.date,
          published: true,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();

    if (bp) {
      for (const handle of post.linkedProductHandles) {
        const { data: prod } = await supabase
          .from('products')
          .select('id')
          .eq('handle', handle)
          .single();
        if (prod) {
          await supabase.from('blog_post_products').upsert(
            { blog_post_id: bp.id, product_id: prod.id },
            { onConflict: 'blog_post_id,product_id' }
          );
        }
      }
    }
  }

  for (const page of mockPolicies) {
    await supabase.from('cms_pages').upsert(
      { slug: page.slug, title: page.title, html_content: page.content, published: true },
      { onConflict: 'slug' }
    );
  }

  for (const block of HOME_CONTENT_DEFAULTS) {
    await supabase.from('home_content_blocks').upsert(
      {
        key: block.key,
        section: block.section,
        label: block.label,
        value: block.value,
        type: block.type,
        sort_order: block.sortOrder,
      },
      { onConflict: 'key' }
    );
  }

  console.log('Seed completed.');
}

seed().catch(console.error);
