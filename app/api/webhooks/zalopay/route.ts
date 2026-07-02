import { NextRequest, NextResponse } from 'next/server';
import { verifyZaloPayCallback } from '@/lib/server/payment/zalopay.adapter';
import { PaymentService } from '@/lib/server/payment/payment.service';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data: dataStr, mac } = body;

  if (!verifyZaloPayCallback(dataStr, mac)) {
    return NextResponse.json({ return_code: -1, return_message: 'mac not equal' });
  }

  const data = JSON.parse(dataStr);
  const embedData = JSON.parse(data.embed_data ?? '{}');
  const orderId = embedData.orderId;
  const success = data.type === 1; // 1 = success

  try {
    await new PaymentService().processWebhook(
      'zalopay',
      `zalopay-${data.zp_trans_id}`,
      { ...data, orderId },
      success
    );
    return NextResponse.json({ return_code: 1, return_message: 'success' });
  } catch {
    return NextResponse.json({ return_code: 0, return_message: 'fail' });
  }
}
