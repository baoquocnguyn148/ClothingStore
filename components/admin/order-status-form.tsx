'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending_payment'],
  pending_payment: ['paid', 'cancelled', 'confirmed'],
  paid: ['confirmed', 'cancelled', 'refunded'],
  confirmed: ['shipping', 'cancelled', 'refunded'],
  shipping: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

function canTransition(currentStatus: string, nextStatus: string) {
  if (currentStatus === nextStatus) return true;
  return ALLOWED_TRANSITIONS[currentStatus]?.includes(nextStatus);
}

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message ?? 'Cập nhật thất bại');
      }
      setMessage('Trạng thái đã cập nhật');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-xl p-6">
      <h3 className="font-semibold">Cập nhật trạng thái</h3>
      <div>
        <label className="block text-sm font-medium mb-2">Trạng thái</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-border rounded-md px-3 py-2"
        >
          {STATUS_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={!canTransition(currentStatus, option.value)}
            >
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          Trạng thái hiện tại: <span className="font-semibold">{STATUS_OPTIONS.find((item) => item.value === currentStatus)?.label ?? currentStatus}</span>
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Ghi chú</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-border rounded-md px-3 py-2"
          rows={3}
          placeholder="Ghi chú nội bộ"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
      </button>
      {message && <p className="text-sm text-secondary">{message}</p>}
    </form>
  );
}
