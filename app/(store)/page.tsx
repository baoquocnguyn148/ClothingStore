import { getCommerceClient } from '@/lib/commerce/get-client';
import { HeroSection } from '@/components/store/hero-section';
import { CategoryBanner } from '@/components/store/category-banner';
import { ProductSection } from '@/components/store/product-section';
import { StylingSection } from '@/components/store/styling-section';
import { CollectionFeature } from '@/components/store/collection-feature';
import { ReviewsSection } from '@/components/store/reviews-section';
import { getHomeContentMap } from '@/lib/home-content/server';
import { getHomeText } from '@/lib/home-content/defaults';

export const revalidate = 0;

export default async function HomePage() {
  const commerce = getCommerceClient();
  const [allProducts, blogPosts] = await Promise.all([
    commerce.getProducts(),
    commerce.getBlogPosts(),
  ]);
  const content = await getHomeContentMap();

  const newArrival = await commerce.getProducts({
    collectionHandle: 'new-arrival',
  });
  const bestSeller = await commerce.getProducts({
    collectionHandle: 'best-seller',
  });

  return (
    <div className="w-full bg-white">
      <HeroSection content={content} />
      <CategoryBanner content={content} />
      <ProductSection
        title={getHomeText(content, 'products.new_title')}
        products={newArrival.length ? newArrival : allProducts}
        tabs={[
          { label: getHomeText(content, 'products.new_tab_1'), tag: 'new' },
          { label: getHomeText(content, 'products.new_tab_2'), tag: 'best-seller' },
        ]}
        viewAllHref="/collections?tag=new"
        viewAllLabel={getHomeText(content, 'products.view_all')}
      />
      <StylingSection posts={blogPosts} content={content} />
      <CollectionFeature content={content} />
      <ProductSection
        title={getHomeText(content, 'products.best_title')}
        products={bestSeller.length ? bestSeller : allProducts}
        showViewAll={true}
        viewAllHref="/collections?tag=best-seller"
        viewAllLabel={getHomeText(content, 'products.view_all')}
      />
      <ReviewsSection content={content} />
    </div>
  );
}
