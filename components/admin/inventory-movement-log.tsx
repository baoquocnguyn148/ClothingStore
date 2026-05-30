'use client';

import { useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import type { InventoryMovementRow } from '@/lib/server/catalog/inventory.service';

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  restock: { label: 'Nhập hàng', color: 'text-emerald-700 bg-emerald-100' },
  return: { label: 'Trả hàng', color: 'text-blue-700 bg-blue-100' },
  adjustment: { label: 'Điều chỉnh', color: 'text-purple-700 bg-purple-100' },
  damage: { label: 'Hàng hỏng', color: 'text-red-700 bg-red-100' },
  transfer: { label: 'Chuyển kho', color: 'text-amber-700 bg-amber-100' },
  admin_adjustment: { label: 'Điều chỉnh (Admin)', color: 'text-purple-700 bg-purple-100' },
  admin_set: { label: 'Đặt lại (Admin)', color: 'text-neutral-700 bg-neutral-100' },
  admin_restock: { label: 'Nhập kho (Admin)', color: 'text-emerald-700 bg-emerald-100' },
  bulk_update: { label: 'Cập nhật hàng loạt', color: 'text-blue-700 bg-blue-100' },
  order_placed: { label: 'Đơn hàng', color: 'text-orange-700 bg-orange-100' },
  other: { label: 'Khác', color: 'text-neutral-700 bg-neutral-100' },
};

function getReasonInfo(reason: string) {
  return REASON_LABELS[reason] ?? { label: reason, color: 'text-neutral-700 bg-neutral-100' };
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  initialItems: InventoryMovementRow[];
  initialTotal: number;
}

const PAGE_SIZE = 50;

export default function InventoryMovementLog({ initialItems, initialTotal }: Props) {
  const [items, setItems] = useState<InventoryMovementRow[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [reason, setReason] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchMovements = useCallback(
    async (opts: { page?: number; reason?: string; dateFrom?: string; dateTo?: string }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(opts.page ?? page),
          pageSize: String(PAGE_SIZE),
          reason: opts.reason ?? reason,
          dateFrom: opts.dateFrom ?? dateFrom,
          dateTo: opts.dateTo ?? dateTo,
        });
        const res = await fetch(`/api/admin/inventory/movements?${params}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setItems(data.data.items);
        setTotal(data.data.total);
      } catch {
        // keep existing
      } finally {
        setLoading(false);
      }
    },
    [page, reason, dateFrom, dateTo]
  );

  const handleFilter = () => {
    setPage(1);
    fetchMovements({ page: 1 });
  };

  const handlePage = (p: number) => {
    setPage(p);
    fetchMovements({ page: p });
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-500">
            Lý do
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400 cursor-pointer"
          >
            <option value="">Tất cả</option>
            {Object.entries(REASON_LABELS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-500">
            Từ ngày
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-neutral-500">
            Đến ngày
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
        </div>
        <button
          onClick={handleFilter}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <Search size={14} />
          Lọc
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-wrap relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        )}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Sản phẩm / SKU</th>
              <th>Size / Màu</th>
              <th className="text-center">Thay đổi</th>
              <th>Lý do</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-neutral-400">
                  Không có biến động tồn kho
                </td>
              </tr>
            ) : (
              items.map((m) => {
                const reasonInfo = getReasonInfo(m.reason);
                return (
                  <tr key={m.id}>
                    <td className="text-xs text-neutral-500 whitespace-nowrap">
                      {formatDateTime(m.createdAt)}
                    </td>
                    <td>
                      <p className="font-semibold text-sm line-clamp-1">
                        {m.productTitle ?? '—'}
                      </p>
                      <p className="text-xs text-neutral-400 font-mono">{m.variantSku}</p>
                    </td>
                    <td className="text-sm text-neutral-600">
                      {m.variantSize && (
                        <span className="admin-badge-size">{m.variantSize}</span>
                      )}
                      {m.variantColorName && (
                        <span className="ml-1 text-neutral-500">{m.variantColorName}</span>
                      )}
                    </td>
                    <td className="text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-black ${
                          m.delta > 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {m.delta > 0 ? (
                          <TrendingUp size={13} />
                        ) : (
                          <TrendingDown size={13} />
                        )}
                        {m.delta > 0 ? `+${m.delta}` : m.delta}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${reasonInfo.color}`}
                      >
                        {reasonInfo.label}
                      </span>
                    </td>
                    <td className="text-sm text-neutral-500 max-w-[200px]">
                      <p className="line-clamp-2">{m.note ?? '—'}</p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Tổng {total} biến động
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    p === page ? 'bg-black text-white' : 'border border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page === totalPages}
              className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
