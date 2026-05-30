'use client';

import { useState, useCallback } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import type { InventoryVariantRow } from '@/lib/server/catalog/inventory.service';

const REASONS = [
  { value: 'restock', label: 'Nhập hàng mới' },
  { value: 'return', label: 'Trả hàng từ khách' },
  { value: 'adjustment', label: 'Điều chỉnh tồn kho' },
  { value: 'damage', label: 'Hàng hỏng / thất thoát' },
  { value: 'transfer', label: 'Chuyển kho' },
  { value: 'other', label: 'Khác' },
];

interface Props {
  variant: InventoryVariantRow;
  onClose: () => void;
  onSuccess: (variantId: string, newQty: number) => void;
}

export function InventoryMovementModal({ variant, onClose, onSuccess }: Props) {
  const [newQty, setNewQty] = useState(String(variant.stockQty));
  const [reason, setReason] = useState('restock');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const delta = parseInt(newQty, 10) - variant.stockQty;
  const isValidQty = !isNaN(parseInt(newQty, 10)) && parseInt(newQty, 10) >= 0;

  const handleSubmit = useCallback(async () => {
    const qty = parseInt(newQty, 10);
    if (!isValidQty) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/variants/${variant.variantId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty, reason, note: note.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Cập nhật thất bại');
      }

      onSuccess(variant.variantId, qty);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [newQty, reason, note, variant, isValidQty, onSuccess, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Cập nhật tồn kho</h3>
            <p className="mt-1 text-sm text-neutral-500">{variant.productTitle}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
                {variant.size}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: variant.colorHex + '22',
                  color: variant.colorHex,
                  border: `1px solid ${variant.colorHex}44`,
                }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: variant.colorHex }}
                />
                {variant.colorName}
              </span>
              <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-mono text-neutral-500">
                {variant.sku}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current stock indicator */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-5 py-4 border border-neutral-200">
            <span className="text-sm text-neutral-500">Tồn kho hiện tại</span>
            <span
              className={`text-2xl font-black ${
                variant.isSoldOut
                  ? 'text-red-600'
                  : variant.isLowStock
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {variant.stockQty}
            </span>
          </div>

          {/* New quantity */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-600">
              Số lượng mới *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-lg font-bold outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                placeholder="0"
                autoFocus
              />
              {isValidQty && delta !== 0 && (
                <span
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold ${
                    delta > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              )}
            </div>
            {isValidQty && delta !== 0 && (
              <p className="mt-1.5 text-xs text-neutral-400">
                {delta > 0
                  ? `Nhập thêm ${delta} đơn vị vào kho`
                  : `Giảm ${Math.abs(delta)} đơn vị khỏi kho`}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-600">
              Lý do *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 cursor-pointer"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-600">
              Ghi chú (Tuỳ chọn)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="VD: Nhập lô hàng mới từ nhà cung cấp A..."
              className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isValidQty || delta === 0}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Check size={16} />
                Xác nhận
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
