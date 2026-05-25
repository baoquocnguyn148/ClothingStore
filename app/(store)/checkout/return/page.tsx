'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart/cart-context';

function ReturnContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'success' | 'fail' | 'pending'>('pending');
  const { refreshCart } = useCart();

  useEffect(() => {
    if (searchParams.get('vnpay') === '1') {
      const code = searchParams.get('vnp_ResponseCode');
      setStatus(code === '00' ? 'success' : 'fail');
    } else if (searchParams.get('momo') === '1') {
      const code = searchParams.get('resultCode');
      setStatus(code === '0' ? 'success' : 'fail');
    } else {
      setStatus('pending');
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success') {
      refreshCart();
    }
  }, [refreshCart, status]);

  return (
    <div className="container-mqb py-24 text-center max-w-lg mx-auto">
      {status === 'success' && (
        <>
          <h1 className="text-heading-lg uppercase mb-4">Thanh toán thành công</h1>
          <p className="text-secondary mb-8">Cảm ơn bạn đã mua hàng tại B&D.</p>
        </>
      )}
      {status === 'fail' && (
        <>
          <h1 className="text-heading-lg uppercase mb-4">Thanh toán thất bại</h1>
          <p className="text-secondary mb-8">Vui lòng thử lại hoặc chọn phương thức khác.</p>
        </>
      )}
      {status === 'pending' && (
        <>
          <h1 className="text-heading-lg uppercase mb-4">Đang xử lý</h1>
          <p className="text-secondary mb-8">Chúng tôi đang xác nhận thanh toán của bạn.</p>
        </>
      )}
      <Link href="/account/orders" className="btn-primary mr-4">
        Xem đơn hàng
      </Link>
      <Link href="/" className="btn-secondary">
        Về trang chủ
      </Link>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={<div className="container-mqb py-24 text-center">Đang tải...</div>}>
      <ReturnContent />
    </Suspense>
  );
}
