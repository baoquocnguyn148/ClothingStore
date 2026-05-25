/**
 * Shopify cart helpers for Phase 5 checkout integration.
 * Call from server actions or API routes when Storefront token is configured.
 */

const CART_CREATE = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors { message }
    }
  }
`;

export async function createShopifyCheckoutUrl(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<string | null> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) return null;

  try {
    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query: CART_CREATE,
        variables: { input: { lines } },
      }),
    });
    const json = await res.json();
    return json?.data?.cartCreate?.cart?.checkoutUrl ?? null;
  } catch {
    return null;
  }
}
