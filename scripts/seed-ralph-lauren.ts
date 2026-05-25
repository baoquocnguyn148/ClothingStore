import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log('Seeding Ralph Lauren products...');

  // 1. Create Category
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .upsert({
      slug: 'polo-ralph-lauren',
      name: 'Polo Ralph Lauren',
      image_url: null,
    }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (catError || !catData) {
    console.error('Error creating category', catError);
    return;
  }
  
  const categoryId = catData.id;

  const products = [
    {
      handle: 'navy-classic-polo',
      title: 'Classic Fit Mesh Polo Shirt',
      description: 'A timeless navy polo shirt with a subtle embroidered logo. Cut for a relaxed, comfortable fit in breathable cotton mesh.',
      price: 1500000,
      compare_at_price: 1800000,
      category_id: categoryId,
      published: true,
      image: '/images/products/navy_polo.png',
      sizes: ['S', 'M', 'L', 'XL'],
    },
    {
      handle: 'cable-knit-sweater-cream',
      title: 'Cable-Knit Cotton Sweater',
      description: 'A cream-colored cable-knit sweater, perfect for layering. Premium cotton yarn provides a soft, breathable feel.',
      price: 2500000,
      compare_at_price: null,
      category_id: categoryId,
      published: true,
      image: '/images/products/cable_sweater.png',
      sizes: ['S', 'M', 'L'],
    },
    {
      handle: 'oxford-button-down-blue',
      title: 'Oxford Button-Down Shirt',
      description: 'A crisp light blue oxford shirt with a tailored fit. An essential piece for any classic wardrobe.',
      price: 1800000,
      compare_at_price: 2000000,
      category_id: categoryId,
      published: true,
      image: '/images/products/oxford_shirt.png',
      sizes: ['M', 'L', 'XL'],
    },
    {
      handle: 'khaki-harrington-jacket',
      title: 'Chino Harrington Jacket',
      description: 'A classic khaki Harrington jacket with a plaid lining. Perfect for transitional weather.',
      price: 3500000,
      compare_at_price: null,
      category_id: categoryId,
      published: true,
      image: '/images/products/khaki_jacket.png',
      sizes: ['S', 'M', 'L', 'XL'],
    }
  ];

  for (const p of products) {
    // Upsert product
    const { data: productData, error: productError } = await supabase
      .from('products')
      .upsert({
        handle: p.handle,
        title: p.title,
        description: p.description,
        base_price: p.price,
        compare_at_price: p.compare_at_price,
        category_id: p.category_id,
        published: p.published,
      }, { onConflict: 'handle' })
      .select('id')
      .single();

    if (productError || !productData) {
      console.error('Error inserting product', p.title, productError);
      continue;
    }

    const productId = productData.id;

    // Delete existing images and variants
    await supabase.from('product_images').delete().eq('product_id', productId);
    await supabase.from('product_variants').delete().eq('product_id', productId);

    // Insert Image
    await supabase.from('product_images').insert({
      product_id: productId,
      url: p.image,
      alt_text: p.title,
      position: 1,
    });

    // Insert Variants
    const variants = p.sizes.map((size) => ({
      product_id: productId,
      sku: `${p.handle.toUpperCase()}-${size}`,
      title: size,
      price: p.price,
      stock_qty: Math.floor(Math.random() * 20) + 5, // 5 to 25 stock
      is_active: true,
    }));

    await supabase.from('product_variants').insert(variants);

    console.log(`Inserted ${p.title} with ${p.sizes.length} variants.`);
  }

  console.log('Seed complete!');
}

seed().catch(console.error);
