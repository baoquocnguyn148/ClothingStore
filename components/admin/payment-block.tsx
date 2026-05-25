'use client';

import { useState } from 'react';
import { CreditCard, Check, DollarSign } from 'lucide-react';

interface PaymentBlockProps {
  orderId: string;
  codPayment: any;
  orderStatus: string;
}

export function PaymentBlock({ orderId, codPayment, orderStatus }: PaymentBlockProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!codPayment) {
    return null;
  }

  const isCollected = codPayment.status === 'completed';
  const isPending = codPayment.status === 'pending';

  const handleMarkCollected = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payments/${codPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || result?.error || 'Lỗi không xác định');
      }

      setMessage({ type: 'success', text: 'Đã đánh dấu thu tiền' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Lỗi không xác định' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-card p-6">
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <DollarSign size={18} />
        Thanh toán COD
      </h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Phương thức</span>
          <span className="font-medium">Thanh toán khi nhận hàng</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Số tiền</span>
          <span className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(codPayment.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Trạng thái</span>
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            isCollected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {isCollected ? (
              <>
                <Check size={12} className="mr-1" />
                Đã thu tiền
              </>
            ) : (
              'Chưa thu tiền'
            )}
          </span>
        </div>
        {codPayment.transaction_ref && (
          <div className="flex justify-between">
            <span className="text-gray-600">Mã giao dịch</span>
            <span className="font-mono text-xs">{codPayment.transaction_ref}</span>
          </div>
        )}
      </div>

      {isPending && orderStatus !== 'cancelled' && orderStatus !== 'refunded' && (
        <div className="mt-4 pt-4 border-t">
          {message && (
            <div className={`mb-3 px-3 py-2 rounded text-xs ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
          <button
            onClick={handleMarkCollected}
            disabled={loading}
            className="admin-btn admin-btn-primary w-full"
          >
            {loading ? 'Đang xử lý...' : 'Đánh dấu đã thu tiền'}
          </button>
        </div>
      )}
    </div>
  );
}
