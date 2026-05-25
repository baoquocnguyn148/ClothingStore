import type { BlogPost } from '@/lib/commerce/types';

const blogImages = [
  '/images/lifestyle/lifestyle_1.png',
  '/images/lifestyle/lifestyle_2.png',
  '/images/products/navy_polo.png',
  '/images/products/cable_sweater.png',
  '/images/products/oxford_shirt.png',
  '/images/products/khaki_jacket.png',
];

export const mockBlogPosts: BlogPost[] = [
  {
    slug: 'levents-xl-logo-zipper-hoodie-boxy',
    title: 'Levents® XL Logo Zipper Hoodie Boxy',
    date: '6-2-2026',
    image: blogImages[0],
    excerpt: 'Outfit styling với XL Logo Zipper Hoodie.',
    linkedProductHandles: ['levents-seasonal-hoodie-boxy', 'levents-xl-logo-boxy-sweater'],
  },
  {
    slug: 'levents-x-hello-kitty-striped-oversized-jersey-tee',
    title: 'Levents® x Hello Kitty | Striped Oversized Jersey Tee',
    date: '15-1-2026',
    image: blogImages[1],
    excerpt: 'Hello Kitty striped jersey tee outfit.',
    linkedProductHandles: ['levents-x-hello-kitty-striped-boxy-tee-blue'],
  },
  {
    slug: 'levents-xl-logo-boxy-sweater-1',
    title: 'Levents® XL Logo Boxy Sweater',
    date: '6-2-2026',
    image: blogImages[2],
    excerpt: 'Layering với boxy sweater.',
    linkedProductHandles: ['levents-xl-logo-boxy-sweater'],
  },
  {
    slug: 'levents-x-hello-kitty-joy-icon-heavyweight-raglan-long-sleeve-boxy-tee',
    title: 'Levents® x Hello Kitty | Joy Icon Heavyweight Raglan Long Sleeve Boxy Tee',
    date: '15-1-2026',
    image: blogImages[3],
    excerpt: 'Joy Icon raglan styling.',
    linkedProductHandles: ['levents-x-hello-kitty-joy-icon-long-sleeve-boxy-tee-grey'],
  },
  {
    slug: 'levents-striped-fur-knit-boxy-sweater',
    title: 'Levents® Striped Fur Knit Boxy Sweater',
    date: '6-2-2026',
    image: blogImages[4],
    excerpt: 'Fur knit sweater street style.',
    linkedProductHandles: ['levents-xl-logo-boxy-sweater'],
  },
  {
    slug: 'levents-raw-denim-stitch-baggy-jeans',
    title: 'Levents® Raw Denim Stitch Baggy Jeans',
    date: '6-2-2026',
    image: blogImages[5],
    excerpt: 'Denim baggy jeans outfit.',
    linkedProductHandles: ['levents-triple-star-classic-shorts'],
  },
  {
    slug: 'levents-seasonal-hoodie-boxy-1',
    title: 'Levents® Seasonal Hoodie Boxy',
    date: '6-2-2026',
    image: blogImages[0],
    excerpt: 'Seasonal hoodie casual look.',
    linkedProductHandles: ['levents-seasonal-hoodie-boxy'],
  },
];
