import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixImages() {
  console.log('Fixing broken Unsplash images...');

  // 1. Fix product_images
  const productImages = [
    '/images/products/navy_polo.png',
    '/images/products/cable_sweater.png',
    '/images/products/oxford_shirt.png',
    '/images/products/khaki_jacket.png',
  ];

  const { data: piData } = await supabase
    .from('product_images')
    .select('id, url')
    .ilike('url', '%unsplash%');
  
  if (piData && piData.length > 0) {
    for (let i = 0; i < piData.length; i++) {
      await supabase
        .from('product_images')
        .update({ url: productImages[i % productImages.length] })
        .eq('id', piData[i].id);
    }
    console.log(`Updated ${piData.length} product images.`);
  }

  // 2. Fix collections
  const { data: cData } = await supabase
    .from('collections')
    .select('id, image_url')
    .ilike('image_url', '%unsplash%');

  if (cData && cData.length > 0) {
    for (const c of cData) {
      await supabase
        .from('collections')
        .update({ image_url: '/images/lifestyle/lifestyle_1.png' })
        .eq('id', c.id);
    }
    console.log(`Updated ${cData.length} collections.`);
  }

  // 3. Fix categories
  const { data: catData } = await supabase
    .from('categories')
    .select('id, image_url')
    .ilike('image_url', '%unsplash%');

  if (catData && catData.length > 0) {
    for (const c of catData) {
      await supabase
        .from('categories')
        .update({ image_url: '/images/lifestyle/lifestyle_1.png' })
        .eq('id', c.id);
    }
    console.log(`Updated ${catData.length} categories.`);
  }

  // 4. Fix blog_posts
  const { data: bData } = await supabase
    .from('blog_posts')
    .select('id, image_url')
    .ilike('image_url', '%unsplash%');

  if (bData && bData.length > 0) {
    for (const b of bData) {
      await supabase
        .from('blog_posts')
        .update({ image_url: '/images/lifestyle/lifestyle_2.png' })
        .eq('id', b.id);
    }
    console.log(`Updated ${bData.length} blog posts.`);
  }

  console.log('Fix complete!');
}

fixImages().catch(console.error);
