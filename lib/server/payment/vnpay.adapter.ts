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
  // VNPay requires time in GMT+7 format: yyyyMMddHHmmss
  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const createDate = 
    `${gmt7.getUTCFullYear()}` +
    `${String(gmt7.getUTCMonth() + 1).padStart(2, '0')}` +
    `${String(gmt7.getUTCDate()).padStart(2, '0')}` +
    `${String(gmt7.getUTCHours()).padStart(2, '0')}` +
    `${String(gmt7.getUTCMinutes()).padStart(2, '0')}` +
    `${String(gmt7.getUTCSeconds()).padStart(2, '0')}`;
  
  const expireGmt7 = new Date(gmt7.getTime() + 15 * 60000);
  const expireDate = 
    `${expireGmt7.getUTCFullYear()}` +
    `${String(expireGmt7.getUTCMonth() + 1).padStart(2, '0')}` +
    `${String(expireGmt7.getUTCDate()).padStart(2, '0')}` +
    `${String(expireGmt7.getUTCHours()).padStart(2, '0')}` +
    `${String(expireGmt7.getUTCMinutes()).padStart(2, '0')}` +
    `${String(expireGmt7.getUTCSeconds()).padStart(2, '0')}`;

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
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
      params[key] = value;
    }
  }

  const sorted = sortObject(params);
  const signData = new URLSearchParams(sorted).toString();
  const hmac = crypto.createHmac('sha512', config.hashSecret);
  const computed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === computed;
}
