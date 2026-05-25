export type PaymentProviderType = 'vnpay' | 'momo' | 'zalopay' | 'cod';

export const PAYMENT_PROVIDERS: PaymentProviderType[] = [
  'cod',
  'vnpay',
  'momo',
  'zalopay',
];

export function isPaymentProvider(value: string): value is PaymentProviderType {
  return PAYMENT_PROVIDERS.includes(value as PaymentProviderType);
}
