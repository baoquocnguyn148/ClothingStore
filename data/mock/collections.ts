import type { Collection } from '@/lib/commerce/types';

export const mockCollections: Collection[] = [
  {
    handle: 'new-arrival',
    title: 'NEW ARRIVAL',
    description: 'Sản phẩm mới nhất từ B&D',
    productHandles: [
      'levents-triple-star-corduroy-classic-cap',
      'levents-seasonal-hoodie-boxy',
      'levents-xl-logo-boxy-sweater',
      'levents-x-hello-kitty-joy-icon-long-sleeve-boxy-tee-grey',
      'levents-travel-cities-long-sleeve-boxy-tee',
      'levents-rhinestone-long-sleeve-boxy-tee',
    ],
  },
  {
    handle: 'best-seller',
    title: 'BEST SELLER',
    description: 'Sản phẩm bán chạy nhất',
    productHandles: [
      'levents-rhinestone-long-sleeve-boxy-tee',
      'levents-sakura-signature-logo-semi-oversized-tee',
      'levents-dream-maker-semi-oversized-tee',
      'levents-x-hello-kitty-joy-icon-long-sleeve-boxy-tee-grey',
      'levents-x-hello-kitty-striped-boxy-tee-blue',
      'levents-blink-blink-xl-logo-oversized-tee-black',
      'levents-triple-star-classic-shorts',
    ],
  },
  {
    handle: 'bd-x-hello-kitty',
    title: 'B&D® x HELLO KITTY',
    description: 'Fantasy Collection - Adorable Dreams',
    productHandles: [
      'levents-x-hello-kitty-joy-icon-long-sleeve-boxy-tee-grey',
      'levents-x-hello-kitty-striped-boxy-tee-blue',
    ],
  },
  {
    handle: 'sakura',
    title: 'Sakura Collection',
    productHandles: [
      'levents-sakura-signature-logo-semi-oversized-tee',
      'levents-sakura-classic-cap',
    ],
  },
  {
    handle: 'dream-maker',
    title: 'Dream Maker',
    productHandles: ['levents-dream-maker-semi-oversized-tee'],
  },
  {
    handle: 'holiday-gifts',
    title: 'HOLIDAY GIFTS',
    productHandles: [
      'levents-seasonal-hoodie-boxy',
      'levents-xl-logo-boxy-sweater',
      'levents-rhinestone-long-sleeve-boxy-tee',
    ],
  },
];

export const featuredCollections = [
  {
    handle: 'bd-x-hello-kitty',
    title: 'B&D® X HELLO KITTY - ADORABLE DREAMS',
    image: '/images/lifestyle/lifestyle_1.png',
  },
  {
    handle: 'new-arrival',
    title: 'B&D® COLLECTION NEW BRANDING - SHARE YOUR COLOR',
    image: '/images/lifestyle/lifestyle_2.png',
  },
  {
    handle: 'dream-maker',
    title: 'B&D® 3RD ANNIVERSARY "ONE WORLD ONE LOVE"',
    image: '/images/products/navy_polo.png',
  },
];
