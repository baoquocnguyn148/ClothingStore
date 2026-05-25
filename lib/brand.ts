export const BRAND = {
  name: 'B&D',
  fullName: 'B&D®',
  tagline: 'Dream Maker',
  siteTitle: 'B&D | Dream Maker',
  description: 'B&D - Vietnamese Streetwear Brand. Easy Streetwear for dreamers.',
  company: 'CÔNG TY CỔ PHẦN B&D GLOBAL',
  emails: {
    customer: 'customercare@bd.asia',
    business: 'business@bd.asia',
  },
  hotline: '1900 633 028',
  phone: '028 888 99 616',
} as const;

export function brandProductTitle(title: string): string {
  return title.replace(/Levents®/gi, 'B&D®').replace(/Levents/gi, 'B&D');
}
