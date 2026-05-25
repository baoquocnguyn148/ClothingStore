'use client';

import { useState } from 'react';
import { CheckCircle, Truck, Package, XCircle } from 'lucide-react';

interface QuickActionsProps {
  orderId: string;
  currentStatus: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
};

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

export function OrderQuickActions({ orderId, currentStatus }: QuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const quickActions = [
    {
      key: 'confirmed',
      label: 'Xác nhận',
      icon: CheckCircle,
      color: 'bg-blue-600 hover:bg-blue-700',
      allowed: canTransition(currentStatus, 'confirmed'),
    },
    {
      key: 'shipping',
      label: 'Đang giao',
      icon: Truck,
      color: 'bg-purple-600 hover:bg-purple-700',
      allowed: canTransition(currentStatus, 'shipping'),
    },
    {
      key: 'delivered',
      label: 'Đã giao',
      icon: Package,
      color: 'bg-green-600 hover:bg-green-700',
      allowed: canTransition(currentStatus, 'delivered'),
    },
    {
      key: 'cancelled',
      label: 'Hủy đơn',
      icon: XCircle,
      color: 'bg-red-600 hover:bg-red-700',
      allowed: canTransition(currentStatus, 'cancelled'),
    },
  ];

  const handleQuickAction = async (status: string) => {
    setLoading(status);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: `Quick action: ${STATUS_LABELS[status]}` }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || result?.error || 'Lỗi không xác định');
      }

      setMessage({ type: 'success', text: `Đã chuyển sang ${STATUS_LABELS[status]}` });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Lỗi không xác định' 
      });
    } finally {
      setLoading(null);
    }
  };

  const availableActions = quickActions.filter(a => a.allowed);

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="admin-card p-6">
      <h2 className="font-semibold mb-4">Hành động nhanh</h2>
      <div className="grid grid-cols-2 gap-3">
        {availableActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              onClick={() => handleQuickAction(action.key)}
              disabled={loading !== null}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white text-sm font-medium ${action.color} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Icon size={16} />
              {loading === action.key ? 'Đang xử lý...' : action.label}
            </button>
          );
        })}
      </div>
      {message && (
        <div className={`mt-3 px-3 py-2 rounded text-xs ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
