import crypto from 'crypto';

export function getZaloPayConfig() {
  const appId = process.env.ZALOPAY_APP_ID;
  const key1 = process.env.ZALOPAY_KEY1;
  const key2 = process.env.ZALOPAY_KEY2;
  if (!appId || !key1 || !key2) return null;

  return {
    appId: Number(appId),
    key1,
    key2,
    endpoint: process.env.ZALOPAY_ENDPOINT ?? 'https://sb-openapi.zalopay.vn/v2/create',
    callbackUrl: process.env.ZALOPAY_CALLBACK_URL ?? 'http://localhost:3000/api/webhooks/zalopay',
    redirectUrl: process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/checkout/return?zalopay=1`
      : 'http://localhost:3000/checkout/return?zalopay=1',
  };
}

export async function createZaloPayOrder(params: {
  orderId: string;
  amount: number;
  orderInfo: string;
}): Promise<{ orderUrl: string; zpTransToken: string } | null> {
  const config = getZaloPayConfig();
  if (!config) return null;

  const appTime = Date.now();
  const appTransId = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${params.orderId.slice(-8)}`;

  const order = {
    app_id: config.appId,
    app_trans_id: appTransId,
    app_user: 'user',
    app_time: appTime,
    item: JSON.stringify([]),
    embed_data: JSON.stringify({ redirecturl: config.redirectUrl, orderId: params.orderId }),
    amount: params.amount,
    description: params.orderInfo,
    bank_code: '',
    callback_url: config.callbackUrl,
  };

  const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
  const mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex');

  const res = await fetch(config.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...order, app_id: String(order.app_id), app_time: String(order.app_time), amount: String(order.amount), mac }).toString(),
  });

  const json = await res.json();
  if (json.return_code === 1 && json.order_url) {
    return { orderUrl: json.order_url, zpTransToken: json.zp_trans_token };
  }
  return null;
}

export function verifyZaloPayCallback(data: string, mac: string): boolean {
  const config = getZaloPayConfig();
  if (!config) return false;
  const computed = crypto.createHmac('sha256', config.key2).update(data).digest('hex');
  return computed === mac;
}
