import crypto from 'crypto';

export interface VNPayConfig {
  tmnCode: string;
  hashSecret: string;
  paymentUrl: string;
  returnUrl: string;
  ipnUrl: string;
}

export function getVNPayConfig(): VNPayConfig | null {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  if (!tmnCode || !hashSecret) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return {
    tmnCode,
    hashSecret,
    paymentUrl: process.env.VNPAY_PAYMENT_URL ?? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: `${baseUrl}/checkout/return?vnpay=1`,
    ipnUrl: `${baseUrl}/api/webhooks/vnpay`,
  };
}

function sortObject(obj: Record<string, string>) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {} as Record<string, string>);
}

export function buildVNPayUrl(params: {
  amount: number;
  orderInfo: string;
  orderId: string;
  ipAddr?: string;
}): string | null {
  const config = getVNPayConfig();
  if (!config) return null;

  const date = new Date();
  const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const expireDate = new Date(date.getTime() + 15 * 60000)
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);

  let vnpParams: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: String(params.amount * 100),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: params.ipAddr ?? '127.0.0.1',
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  vnpParams = sortObject(vnpParams);
  const signData = new URLSearchParams(vnpParams).toString();
  const hmac = crypto.createHmac('sha512', config.hashSecret);
  const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return `${config.paymentUrl}?${signData}&vnp_SecureHash=${secureHash}`;
}

export function verifyVNPayIpn(query: Record<string, string>): boolean {
  const config = getVNPayConfig();
  if (!config) return false;

  const secureHash = query.vnp_SecureHash;
  const params = { ...query };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sorted = sortObject(params);
  const signData = new URLSearchParams(sorted).toString();
  const hmac = crypto.createHmac('sha512', config.hashSecret);
  const computed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === computed;
}
