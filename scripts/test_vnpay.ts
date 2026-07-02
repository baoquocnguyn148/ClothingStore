
import crypto from 'crypto';
import { createAdminClient } from '../lib/supabase/admin';
import { PaymentService } from '../lib/server/payment/payment.service';
import { getVNPayConfig } from '../lib/server/payment/vnpay.adapter';

async function runTest() {
  console.log('--- BẮT ĐẦU TEST LUỒNG VNPAY ---');
  const db = createAdminClient();

  // 1. Tạo một user tạm thời bằng Auth Admin
  const { data: authData, error: authErr } = await db.auth.admin.createUser({
    email: `testvnpay_${Date.now()}@example.com`,
    password: 'password123',
    email_confirm: true,
  });

  if (authErr || !authData.user) {
    console.error('❌ Lỗi tạo user:', authErr);
    return;
  }
  const userId = authData.user.id;

  // 2. Tạo một Order tạm thời
  console.log('1. Đang tạo đơn hàng giả lập...');
  const orderNumber = 'TEST-' + Math.floor(Math.random() * 10000);
  const { data: order, error: orderErr } = await db.from('orders').insert({
    user_id: userId,
    order_number: orderNumber,
    status: 'pending_payment',
    total: 500000,
    shipping_fee: 0,
    subtotal: 500000,
    discount_amount: 0,
    shipping_address: {},
  }).select().single();

  if (orderErr) {
    console.error('❌ Lỗi tạo order:', orderErr);
    return;
  }
  console.log(`✅ Đã tạo đơn hàng: ${order.id} (Mã: ${orderNumber})`);

  // 3. Gọi PaymentService để tạo payment URL
  console.log('2. Gọi PaymentService tạo URL VNPay...');
  const paymentService = new PaymentService();
  const { payment, paymentUrl } = await paymentService.createPayment(order.id, 'vnpay');
  console.log(`✅ URL tạo ra: \n   ${paymentUrl}`);
  console.log(`✅ Database Payment ID: ${payment.id}, Trạng thái: ${payment.status}`);

  // 4. Giả lập VNPay server callback về IPN endpoint
  console.log('3. Giả lập quá trình VNPay gửi callback (IPN) về server...');
  const config = getVNPayConfig();
  if (!config) throw new Error('Thiếu config VNPay');

  // Lấy các tham số từ URL vừa tạo
  const urlObj = new URL(paymentUrl);
  const params: Record<string, string> = {};
  urlObj.searchParams.forEach((val, key) => {
    params[key] = val;
  });

  // Ghi đè các tham số trả về như một giao dịch thành công
  const callbackParams: Record<string, string> = {
    vnp_Amount: params.vnp_Amount,
    vnp_BankCode: 'NCB',
    vnp_BankTranNo: 'VNP123456789',
    vnp_CardType: 'ATM',
    vnp_OrderInfo: params.vnp_OrderInfo,
    vnp_PayDate: new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14),
    vnp_ResponseCode: '00', // 00 là thành công
    vnp_TmnCode: config.tmnCode,
    vnp_TransactionNo: Math.floor(Math.random() * 100000000).toString(),
    vnp_TransactionStatus: '00',
    vnp_TxnRef: params.vnp_TxnRef,
  };

  // Ký URL callback
  const sortObject = (obj: Record<string, string>) => {
    return Object.keys(obj).sort().reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {} as Record<string, string>);
  };

  const sortedCallback = sortObject(callbackParams);
  const signData = new URLSearchParams(sortedCallback).toString();
  const hmac = crypto.createHmac('sha512', config.hashSecret);
  const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  callbackParams['vnp_SecureHash'] = secureHash;

  // Gửi request callback (IPN) tới Next.js API
  const ipnUrl = `http://localhost:3000/api/webhooks/vnpay?${new URLSearchParams(callbackParams).toString()}`;
  console.log(`✅ Đang gọi Webhook IPN: \n   ${ipnUrl}`);

  const ipnRes = await fetch(ipnUrl);
  const ipnData = await ipnRes.text();
  console.log(`✅ Kết quả Webhook: HTTP ${ipnRes.status} - ${ipnData}`);

  // 5. Kiểm tra DB xem trạng thái order và payment có được update không
  console.log('4. Kiểm tra trạng thái trong Database...');
  const { data: updatedPayment } = await db.from('payments').select('status').eq('id', payment.id).single();
  const { data: updatedOrder } = await db.from('orders').select('status').eq('id', order.id).single();

  console.log(`   - Payment status: ${updatedPayment?.status === 'completed' ? '✅ COMPLETED' : '❌ ' + updatedPayment?.status}`);
  console.log(`   - Order status: ${updatedOrder?.status === 'paid' ? '✅ PAID' : '❌ ' + updatedOrder?.status}`);

  if (updatedPayment?.status === 'completed' && updatedOrder?.status === 'paid') {
    console.log('🎉 TẤT CẢ LUỒNG HOẠT ĐỘNG HOÀN HẢO!');
  } else {
    console.log('⚠️ Có lỗi xảy ra trong quá trình cập nhật trạng thái.');
  }
}

runTest().catch(console.error);
