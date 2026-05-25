import crypto from 'crypto';

export function getMoMoConfig() {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  if (!partnerCode || !accessKey || !secretKey) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return {
    partnerCode,
    accessKey,
    secretKey,
    endpoint: process.env.MOMO_ENDPOINT ?? 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: `${baseUrl}/checkout/return?momo=1`,
    ipnUrl: `${baseUrl}/api/webhooks/momo`,
  };
}

export async function createMoMoPayment(params: {
  orderId: string;
  amount: number;
  orderInfo: string;
}): Promise<{ payUrl: string } | null> {
  const config = getMoMoConfig();
  if (!config) return null;

  const requestId = params.orderId;
  const orderId = params.orderId;
  const requestType = 'captureWallet';
  const extraData = '';
  const autoCapture = true;
  const lang = 'vi';

  const rawSignature = `accessKey=${config.accessKey}&amount=${params.amount}&extraData=${extraData}&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=${params.orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto
    .createHmac('sha256', config.secretKey)
    .update(rawSignature)
    .digest('hex');

  const body = {
    partnerCode: config.partnerCode,
    partnerName: 'B&D',
    storeId: 'BDStore',
    requestId,
    amount: params.amount,
    orderId,
    orderInfo: params.orderInfo,
    redirectUrl: config.redirectUrl,
    ipnUrl: config.ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    signature,
  };

  const res = await fetch(config.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (json.resultCode === 0 && json.payUrl) {
    return { payUrl: json.payUrl };
  }
  return null;
}

export function verifyMoMoIpn(body: Record<string, unknown>): boolean {
  const config = getMoMoConfig();
  if (!config) return false;

  const signature = body.signature as string;
  const rawSignature = `accessKey=${config.accessKey}&amount=${body.amount}&extraData=${body.extraData ?? ''}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
  const computed = crypto
    .createHmac('sha256', config.secretKey)
    .update(rawSignature)
    .digest('hex');

  return signature === computed;
}
