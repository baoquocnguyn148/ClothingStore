import { redirect } from 'next/navigation';
import { verifyVNPayIpn } from '@/lib/server/payment/vnpay.adapter';
import { verifyMoMoIpn } from '@/lib/server/payment/momo.adapter';
import { verifyZaloPayCallback } from '@/lib/server/payment/zalopay.adapter';
import { PaymentService } from '@/lib/server/payment/payment.service';

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const paymentService = new PaymentService();
  
  if (params.vnpay === '1') {
    const isValid = verifyVNPayIpn(params);
    const isSuccess = params.vnp_ResponseCode === '00';
    const orderId = params.vnp_TxnRef;

    if (!isValid || !isSuccess) {
      redirect(`/checkout/failed?order=${orderId}`);
    }
    
    // Fallback update for localhost testing (IPN usually handles this)
    try {
      const eventId = `vnpay-${params.vnp_TransactionNo ?? params.vnp_TxnRef}`;
      await paymentService.processWebhook('vnpay', eventId, params, isSuccess);
    } catch (e) {
      console.error('Local webhook process failed:', e);
    }
    
    redirect(`/checkout/success?order=${orderId}&provider=vnpay`);
  }

  if (params.momo === '1') {
    // Note: MoMo return URL uses slightly different params than IPN, but verifyMoMoIpn might work if signatures match.
    // Usually we just check resultCode=0 for UI redirect, and let IPN handle DB.
    const isSuccess = params.resultCode === '0';
    const orderId = params.orderId;

    if (!isSuccess) {
      redirect(`/checkout/failed?order=${orderId}`);
    }

    // Fallback update for localhost testing
    try {
      if (verifyMoMoIpn(params)) {
        const eventId = `momo-${params.transId ?? params.orderId}`;
        await paymentService.processWebhook('momo', eventId, params, isSuccess);
      }
    } catch (e) {
      console.error('Local webhook process failed:', e);
    }

    redirect(`/checkout/success?order=${orderId}&provider=momo`);
  }

  if (params.zalopay === '1') {
    const isSuccess = params.status === '1'; // ZaloPay status 1 is success in redirect
    const appTransId = params.apptransid;
    // ZaloPay return url doesn't have orderId directly, we might need to rely on the success page checking it
    // or just pass a generic success
    if (!isSuccess) {
      redirect(`/checkout/failed`);
    }
    redirect(`/checkout/success?provider=zalopay&transId=${appTransId}`);
  }

  // Fallback
  redirect(`/`);
}
