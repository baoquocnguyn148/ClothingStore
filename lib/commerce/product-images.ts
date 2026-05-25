import type { Product } from './types';

const LOCAL_PRODUCT_IMAGE_SETS: Record<string, string[]> = {
  'ao-len-basic': [
    '/images/products/Cable-Knit Cotton Sweater 1.png',
    '/images/products/Cable-Knit Cotton Sweater 2.png',
    '/images/products/Cable-Knit Cotton Sweater 3.png',
  ],
  'ao-so-mi': [
    '/images/products/Oxford Button-Down Shirt 1.png',
    '/images/products/Oxford Button-Down Shirt 2.png',
    '/images/products/Oxford Button-Down Shirt 3.png',
  ],
  'cable-knit-cotton-sweater': [
    '/images/products/Cable-Knit Cotton Sweater 1.png',
    '/images/products/Cable-Knit Cotton Sweater 2.png',
    '/images/products/Cable-Knit Cotton Sweater 3.png',
  ],
  'cable-knit-sweater-cream': [
    '/images/products/Cable-Knit Cotton Sweater 1.png',
    '/images/products/Cable-Knit Cotton Sweater 2.png',
    '/images/products/Cable-Knit Cotton Sweater 3.png',
  ],
  'cable-sweater': [
    '/images/products/Cable-Knit Cotton Sweater 1.png',
    '/images/products/Cable-Knit Cotton Sweater 2.png',
    '/images/products/Cable-Knit Cotton Sweater 3.png',
  ],
  'chino-harrington-jacket': [
    '/images/products/Chino Harrington Jacket 1.png',
    '/images/products/Chino Harrington Jacket 2.png',
  ],
  'classic-fit-mesh-polo-shirt': [
    '/images/products/Classic Fit Mesh Polo Shirt 1.png',
    '/images/products/Classic Fit Mesh Polo Shirt 2.png',
    '/images/products/Classic Fit Mesh Polo Shirt 3.png',
  ],
  'khaki-harrington-jacket': [
    '/images/products/Chino Harrington Jacket 1.png',
    '/images/products/Chino Harrington Jacket 2.png',
  ],
  'khaki-jacket': [
    '/images/products/Chino Harrington Jacket 1.png',
    '/images/products/Chino Harrington Jacket 2.png',
  ],
  'levents-travel-cities-long-sleeve-boxy-tee': [
    '/images/products/Chino Harrington Jacket 1.png',
    '/images/products/Chino Harrington Jacket 2.png',
  ],
  'luxury-navy-polo': [
    '/images/products/navy_polo 1.png',
    '/images/products/navy_polo 2.png',
  ],
  'luxury-oxford-t-shirt': [
    '/images/products/Oxford Button-Down Shirt 1.png',
    '/images/products/Oxford Button-Down Shirt 2.png',
    '/images/products/Oxford Button-Down Shirt 3.png',
  ],
  'navy-classic-polo': [
    '/images/products/Classic Fit Mesh Polo Shirt 1.png',
    '/images/products/Classic Fit Mesh Polo Shirt 2.png',
    '/images/products/Classic Fit Mesh Polo Shirt 3.png',
  ],
  'oxford-button-down-shirt': [
    '/images/products/Oxford Button-Down Shirt 1.png',
    '/images/products/Oxford Button-Down Shirt 2.png',
    '/images/products/Oxford Button-Down Shirt 3.png',
  ],
  'oxford-button-down-blue': [
    '/images/products/Oxford Button-Down Shirt 1.png',
    '/images/products/Oxford Button-Down Shirt 2.png',
    '/images/products/Oxford Button-Down Shirt 3.png',
  ],
  'polo-navy': [
    '/images/products/navy_polo 1.png',
    '/images/products/navy_polo 2.png',
  ],
  'navy-polo': [
    '/images/products/navy_polo 1.png',
    '/images/products/navy_polo 2.png',
  ],
};

const LEGACY_IMAGE_SET_KEYS: Record<string, string> = {
  '/images/products/navy_polo.png': 'navy-polo',
  '/images/products/cable_sweater.png': 'cable-knit-cotton-sweater',
  '/images/products/cable_sweater': 'cable-knit-cotton-sweater',
  '/images/products/khaki_jacket.png': 'chino-harrington-jacket',
  '/images/products/khaki_jacket': 'chino-harrington-jacket',
  '/images/products/oxford_shirt.png': 'oxford-button-down-shirt',
  '/images/products/oxford_shirt': 'oxford-button-down-shirt',
};

export function normalizeProductImageKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function resolveProductImages(input: {
  title: string;
  handle?: string;
  images?: string[];
}): string[] {
  const savedImages = input.images?.filter(Boolean) ?? [];
  const hasCustomSavedImages = savedImages.some((image) => !LEGACY_IMAGE_SET_KEYS[image]);
  if (hasCustomSavedImages) {
    return savedImages;
  }

  const titleKey = normalizeProductImageKey(input.title);
  const handleKey = input.handle ? normalizeProductImageKey(input.handle) : '';
  const legacyKey = savedImages.find((image) => LEGACY_IMAGE_SET_KEYS[image]);

  const localImages =
    LOCAL_PRODUCT_IMAGE_SETS[titleKey] ??
    LOCAL_PRODUCT_IMAGE_SETS[handleKey] ??
    (legacyKey ? LOCAL_PRODUCT_IMAGE_SETS[LEGACY_IMAGE_SET_KEYS[legacyKey]] : undefined);

  return localImages?.length ? localImages : savedImages;
}

export function withResolvedProductImages(product: Product): Product {
  return {
    ...product,
    images: resolveProductImages({
      title: product.title,
      handle: product.handle,
      images: product.images,
    }),
  };
}
