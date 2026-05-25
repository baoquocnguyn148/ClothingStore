import { NextResponse } from 'next/server';
import { verifyMoMoIpn } from '@/lib/server/payment/momo.adapter';
import { PaymentService } from '@/lib/server/payment/payment.service';

export async function POST(request: Request) {
  const body = await request.json();

  if (!verifyMoMoIpn(body)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const success = body.resultCode === 0;
  const eventId = `momo-${body.transId ?? body.orderId}`;

  try {
    await new PaymentService().processWebhook(
      'momo',
      eventId,
      body,
      success
    );
    return NextResponse.json({ message: 'Success' });
  } catch {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
