export type HomeContentType = 'text' | 'textarea' | 'url';

export interface HomeContentBlock {
  key: string;
  section: string;
  label: string;
  value: string;
  type: HomeContentType;
  sortOrder: number;
}

export type HomeContentMap = Record<string, string>;

export const HOME_CONTENT_DEFAULTS: HomeContentBlock[] = [
  {
    key: 'announcement.1',
    section: 'Announcement',
    label: 'Announcement 1',
    value: 'FOR DREAMERS ONLY',
    type: 'text',
    sortOrder: 10,
  },
  {
    key: 'announcement.2',
    section: 'Announcement',
    label: 'Announcement 2',
    value: 'LAUNCHING B&D X HELLO KITTY - FANTASY COLLECTION',
    type: 'text',
    sortOrder: 20,
  },
  {
    key: 'announcement.3',
    section: 'Announcement',
    label: 'Announcement 3',
    value: 'TANG B&D XL CUP CHO HOA DON TU 1.700.000',
    type: 'text',
    sortOrder: 30,
  },
  {
    key: 'announcement.4',
    section: 'Announcement',
    label: 'Announcement 4',
    value: 'B&D LOVE YOU',
    type: 'text',
    sortOrder: 40,
  },
  {
    key: 'hero.eyebrow',
    section: 'Hero',
    label: 'Hero eyebrow',
    value: 'ELEVATE YOUR STYLE',
    type: 'text',
    sortOrder: 100,
  },
  {
    key: 'hero.title',
    section: 'Hero',
    label: 'Hero title',
    value: 'B&D X RALPH LAUREN',
    type: 'text',
    sortOrder: 110,
  },
  {
    key: 'hero.subtitle',
    section: 'Hero',
    label: 'Hero subtitle',
    value: 'PREPPY CLASSIC COLLECTION',
    type: 'text',
    sortOrder: 120,
  },
  {
    key: 'hero.primary_label',
    section: 'Hero',
    label: 'Primary button label',
    value: 'Mua ngay - Phong cach Ralph Lauren',
    type: 'text',
    sortOrder: 130,
  },
  {
    key: 'hero.primary_href',
    section: 'Hero',
    label: 'Primary button link',
    value: '/categories/bd-x-hello-kitty',
    type: 'url',
    sortOrder: 140,
  },
  {
    key: 'hero.secondary_label',
    section: 'Hero',
    label: 'Secondary button label',
    value: 'Kham pha bo suu tap',
    type: 'text',
    sortOrder: 150,
  },
  {
    key: 'hero.secondary_href',
    section: 'Hero',
    label: 'Secondary button link',
    value: '/collections',
    type: 'url',
    sortOrder: 160,
  },
  {
    key: 'category.eyebrow',
    section: 'Category Banner',
    label: 'Section eyebrow',
    value: 'The gioi phong cach',
    type: 'text',
    sortOrder: 200,
  },
  {
    key: 'category.title',
    section: 'Category Banner',
    label: 'Section title',
    value: 'Dinh nghia lai su thanh lich',
    type: 'text',
    sortOrder: 210,
  },
  {
    key: 'category.card1_label',
    section: 'Category Banner',
    label: 'Card 1 label',
    value: 'CLASSIC MENSWEAR',
    type: 'text',
    sortOrder: 220,
  },
  {
    key: 'category.card1_title',
    section: 'Category Banner',
    label: 'Card 1 title',
    value: 'Phong cach co dien My',
    type: 'text',
    sortOrder: 230,
  },
  {
    key: 'category.card1_description',
    section: 'Category Banner',
    label: 'Card 1 description',
    value: 'Polo, ao so mi Oxford, ao len cable-knit - nhung item vuot thoi gian danh cho quy ong lich lam.',
    type: 'textarea',
    sortOrder: 240,
  },
  {
    key: 'category.card2_label',
    section: 'Category Banner',
    label: 'Card 2 label',
    value: 'PREPPY ESSENTIALS',
    type: 'text',
    sortOrder: 250,
  },
  {
    key: 'category.card2_title',
    section: 'Category Banner',
    label: 'Card 2 title',
    value: 'Tu do khong the thieu',
    type: 'text',
    sortOrder: 260,
  },
  {
    key: 'category.card2_description',
    section: 'Category Banner',
    label: 'Card 2 description',
    value: 'Tu ao khoac Harrington den quan chino - nen tang phong cach cho moi di dip.',
    type: 'textarea',
    sortOrder: 270,
  },
  {
    key: 'category.card_cta',
    section: 'Category Banner',
    label: 'Card CTA label',
    value: 'Kham pha',
    type: 'text',
    sortOrder: 280,
  },
  {
    key: 'products.new_title',
    section: 'Product Sections',
    label: 'New arrivals title',
    value: 'NEW ARRIVAL',
    type: 'text',
    sortOrder: 300,
  },
  {
    key: 'products.new_tab_1',
    section: 'Product Sections',
    label: 'New arrivals tab 1',
    value: 'NEWEST',
    type: 'text',
    sortOrder: 310,
  },
  {
    key: 'products.new_tab_2',
    section: 'Product Sections',
    label: 'New arrivals tab 2',
    value: 'BEST SELLERS',
    type: 'text',
    sortOrder: 320,
  },
  {
    key: 'products.best_title',
    section: 'Product Sections',
    label: 'Best seller title',
    value: 'BEST SELLER',
    type: 'text',
    sortOrder: 330,
  },
  {
    key: 'products.view_all',
    section: 'Product Sections',
    label: 'View all label',
    value: 'Xem tat ca',
    type: 'text',
    sortOrder: 340,
  },
  {
    key: 'styling.title',
    section: 'Styling',
    label: 'Styling title',
    value: 'STYLING',
    type: 'text',
    sortOrder: 400,
  },
  {
    key: 'styling.cta',
    section: 'Styling',
    label: 'Styling CTA label',
    value: 'Xem them bai viet',
    type: 'text',
    sortOrder: 410,
  },
  {
    key: 'styling.card_label',
    section: 'Styling',
    label: 'Styling card label',
    value: 'Outfit',
    type: 'text',
    sortOrder: 420,
  },
  {
    key: 'collection.title',
    section: 'Collection Feature',
    label: 'Feature title',
    value: 'RALPH LAUREN EDITION.',
    type: 'text',
    sortOrder: 500,
  },
  {
    key: 'collection.description',
    section: 'Collection Feature',
    label: 'Feature description',
    value: 'A timeless blend of classic American sportswear and refined elegance. Curated with meticulous attention to detail, each piece embodies the heritage of Ralph Lauren - crafted for those who appreciate understated luxury and enduring style.',
    type: 'textarea',
    sortOrder: 510,
  },
  {
    key: 'collection.cta',
    section: 'Collection Feature',
    label: 'Feature CTA label',
    value: 'Kham pha ngay',
    type: 'text',
    sortOrder: 520,
  },
  {
    key: 'collection.cta_href',
    section: 'Collection Feature',
    label: 'Feature CTA link',
    value: '/categories/bd-x-hello-kitty',
    type: 'url',
    sortOrder: 530,
  },
  {
    key: 'collection.grid_title',
    section: 'Collection Feature',
    label: 'Collection grid title',
    value: 'Our collection',
    type: 'text',
    sortOrder: 540,
  },
  {
    key: 'reviews.title',
    section: 'Reviews',
    label: 'Reviews title',
    value: 'Feedback',
    type: 'text',
    sortOrder: 600,
  },
  {
    key: 'reviews.score',
    section: 'Reviews',
    label: 'Reviews score',
    value: '4.8',
    type: 'text',
    sortOrder: 610,
  },
  {
    key: 'reviews.count_label',
    section: 'Reviews',
    label: 'Reviews count label',
    value: '128 danh gia',
    type: 'text',
    sortOrder: 620,
  },
  {
    key: 'reviews.cta',
    section: 'Reviews',
    label: 'Reviews CTA label',
    value: 'Xem danh gia',
    type: 'text',
    sortOrder: 630,
  },
  {
    key: 'reviews.cta_href',
    section: 'Reviews',
    label: 'Reviews CTA link',
    value: '/collections',
    type: 'url',
    sortOrder: 640,
  },
];

export const HOME_CONTENT_BY_KEY = Object.fromEntries(
  HOME_CONTENT_DEFAULTS.map((block) => [block.key, block])
);

export const DEFAULT_HOME_CONTENT_MAP: HomeContentMap = Object.fromEntries(
  HOME_CONTENT_DEFAULTS.map((block) => [block.key, block.value])
);

export function mergeHomeContent(overrides?: HomeContentMap | null): HomeContentMap {
  return { ...DEFAULT_HOME_CONTENT_MAP, ...(overrides ?? {}) };
}

export function getHomeText(content: HomeContentMap, key: string): string {
  return content[key] ?? DEFAULT_HOME_CONTENT_MAP[key] ?? '';
}
