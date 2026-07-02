import { NextRequest, NextResponse } from 'next/server';
import { verifyMoMoIpn } from '@/lib/server/payment/momo.adapter';
import { PaymentService } from '@/lib/server/payment/payment.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!verifyMoMoIpn(body)) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const success = Number(body.resultCode) === 0;
    const eventId = `momo-${body.transId ?? body.orderId}`;

    await new PaymentService().processWebhook(
      'momo',
      eventId,
      body as Record<string, unknown>,
      success
    );

    return NextResponse.json({ message: 'OK' });
  } catch (e) {
    console.error('[MoMo Webhook]', e);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
