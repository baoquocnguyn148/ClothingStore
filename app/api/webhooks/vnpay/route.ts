import { NextResponse } from 'next/server';
import { verifyVNPayIpn } from '@/lib/server/payment/vnpay.adapter';
import { PaymentService } from '@/lib/server/payment/payment.service';

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());

  if (!verifyVNPayIpn(params)) {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const success = params.vnp_ResponseCode === '00';
  const eventId = `vnpay-${params.vnp_TransactionNo ?? params.vnp_TxnRef}`;

  try {
    await new PaymentService().processWebhook(
      'vnpay',
      eventId,
      params,
      success
    );
    return new NextResponse(JSON.stringify({ RspCode: '00', Message: 'Success' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new NextResponse(JSON.stringify({ RspCode: '99', Message: 'Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
