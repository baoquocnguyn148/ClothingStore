export function trackEvent(
  name: 'add_to_cart' | 'begin_checkout' | 'view_product',
  properties?: Record<string, string | number>
) {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', name, properties);
  }
  // Extend with Vercel Analytics custom events or GA when needed
}
