'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { useCart } from '@/lib/cart/cart-context';

function CheckoutSuccessContent() {
  const [status, setStatus] = useState<'success' | 'fail' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();

  useEffect(() => {
    const orderId = searchParams.get('order');
    const provider = searchParams.get('provider');

    if (provider === 'cod') {
      setStatus('success');
      setMessage('Đơn hàng COD đã được xác nhận. Bạn sẽ thanh toán khi nhận hàng.');
      refreshCart();
      return;
    }

    if (provider === 'zalopay' && orderId && process.env.NODE_ENV !== 'production') {
      apiFetch(`/orders/${orderId}/pay/complete`, { method: 'POST' })
        .then(() => {
          setStatus('success');
          setMessage('Thanh toán ZaloPay đã được hoàn tất.');
          refreshCart();
        })
        .catch((error) => {
          setStatus('fail');
          setMessage(error.message || 'Không thể hoàn tất thanh toán.');
        });
      return;
    }

    setStatus('success');
    refreshCart();
  }, [refreshCart, searchParams]);

  return (
    <div className="container-mqb py-24 text-center">
      {status === 'success' ? (
        <>
          <h1 className="text-heading-lg uppercase mb-4">Đặt hàng thành công</h1>
          <p className="text-secondary mb-8">{message || 'Cảm ơn bạn đã mua hàng.'}</p>
        </>
      ) : status === 'fail' ? (
        <>
          <h1 className="text-heading-lg uppercase mb-4">Thanh toán thất bại</h1>
          <p className="text-secondary mb-8">{message || 'Vui lòng thử lại hoặc liên hệ hỗ trợ.'}</p>
        </>
      ) : (
        <>
          <h1 className="text-heading-lg uppercase mb-4">Đang xử lý thanh toán</h1>
          <p className="text-secondary mb-8">Vui lòng chờ trong giây lát.</p>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account/orders" className="btn-primary">
          Xem đơn hàng
        </Link>
        <Link href="/" className="btn-secondary">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-mqb py-24 text-center">Đang tải...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
