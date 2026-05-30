'use client';

import { useState, useCallback } from 'react';
import {
  Search,
  Filter,
  Edit3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckSquare,
  Square,
  X,
  PackagePlus,
  AlertCircle,
} from 'lucide-react';
import type { InventoryVariantRow } from '@/lib/server/catalog/inventory.service';
import { InventoryMovementModal } from './inventory-movement-modal';

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

type StatusFilter = 'all' | 'in-stock' | 'low-stock' | 'sold-out';
type SortBy = 'product_title' | 'stock_qty' | 'sku' | 'price';

interface Props {
  initialItems: InventoryVariantRow[];
  initialTotal: number;
  globalThreshold: number;
}

const PAGE_SIZE = 50;
const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Tất cả',
  'in-stock': 'Còn hàng',
  'low-stock': 'Sắp hết',
  'sold-out': 'Hết hàng',
};

export default function InventoryTable({ initialItems, initialTotal, globalThreshold }: Props) {
  const [items, setItems] = useState<InventoryVariantRow[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('product_title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  const [editingVariant, setEditingVariant] = useState<InventoryVariantRow | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkQty, setBulkQty] = useState('');
  const [bulkReason, setBulkReason] = useState('restock');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchInventory = useCallback(
    async (opts: { page?: number; search?: string; status?: StatusFilter; sortBy?: SortBy; sortDir?: 'asc' | 'desc' }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(opts.page ?? page),
          pageSize: String(PAGE_SIZE),
          search: opts.search ?? search,
          status: opts.status ?? status,
          sortBy: opts.sortBy ?? sortBy,
          sortDir: opts.sortDir ?? sortDir,
        });
        const res = await fetch(`/api/admin/inventory?${params}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setItems(data.data.items);
        setTotal(data.data.total);
      } catch {
        // keep existing data
      } finally {
        setLoading(false);
      }
    },
    [page, search, status, sortBy, sortDir]
  );

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
    setSelected(new Set());
    fetchInventory({ search: q, page: 1 });
  };

  const handleStatusFilter = (s: StatusFilter) => {
    setStatus(s);
    setPage(1);
    setSelected(new Set());
    fetchInventory({ status: s, page: 1 });
  };

  const handleSort = (col: SortBy) => {
    const newDir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(col);
    setSortDir(newDir);
    fetchInventory({ sortBy: col, sortDir: newDir });
  };

  const handlePage = (p: number) => {
    setPage(p);
    fetchInventory({ page: p });
  };

  const handleUpdateSuccess = (variantId: string, newQty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? {
              ...item,
              stockQty: newQty,
              stockValue: newQty * item.costPrice,
              isSoldOut: newQty === 0,
              isLowStock: newQty > 0 && newQty <= item.threshold,
            }
          : item
      )
    );
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.variantId)));
    }
  };

  const handleBulkUpdate = async () => {
    const qty = parseInt(bulkQty, 10);
    if (isNaN(qty) || qty < 0 || selected.size === 0) return;

    setBulkLoading(true);
    setBulkError(null);
    try {
      const res = await fetch('/api/admin/inventory/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: Array.from(selected).map((variantId) => ({
            variantId,
            qty,
            reason: bulkReason,
          })),
        }),
      });

      if (!res.ok) throw new Error('Cập nhật thất bại');
      const data = await res.json();
      const results = data.data.results as Array<{ variantId: string; newQty: number; error?: string }>;

      setItems((prev) =>
        prev.map((item) => {
          const result = results.find((r) => r.variantId === item.variantId);
          if (!result || result.error) return item;
          return {
            ...item,
            stockQty: result.newQty,
            stockValue: result.newQty * item.costPrice,
            isSoldOut: result.newQty === 0,
            isLowStock: result.newQty > 0 && result.newQty <= item.threshold,
          };
        })
      );

      setSelected(new Set());
      setBulkQty('');
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setBulkLoading(false);
    }
  };

  const SortIcon = ({ col }: { col: SortBy }) => (
    <span className={`ml-1 text-xs ${sortBy === col ? 'opacity-100' : 'opacity-30'}`}>
      {sortBy === col && sortDir === 'desc' ? '↓' : '↑'}
    </span>
  );

  return (
    <>
      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm SKU, sản phẩm, màu, size..."
            className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 py-2 text-sm outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300"
          />
        </div>

        {/* Status tabs */}
        <div className="flex rounded-lg border border-neutral-200 bg-white overflow-hidden">
          {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-2 text-xs font-semibold transition-colors border-r last:border-r-0 border-neutral-200 ${
                status === s
                  ? 'bg-black text-white'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Export */}
        <a
          href={`/api/admin/inventory/export?status=${status}&search=${encodeURIComponent(search)}`}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
          download
        >
          <Download size={14} />
          Export CSV
        </a>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
          <span className="text-sm font-semibold text-blue-800">
            Đã chọn {selected.size} SKU
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="number"
              min="0"
              value={bulkQty}
              onChange={(e) => setBulkQty(e.target.value)}
              placeholder="Số lượng mới"
              className="w-32 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            />
            <select
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="restock">Nhập hàng</option>
              <option value="adjustment">Điều chỉnh</option>
              <option value="damage">Hàng hỏng</option>
              <option value="other">Khác</option>
            </select>
            <button
              onClick={handleBulkUpdate}
              disabled={bulkLoading || !bulkQty}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {bulkLoading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <PackagePlus size={14} />
              )}
              Áp dụng
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          {bulkError && (
            <p className="w-full text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} /> {bulkError}
            </p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrap relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        )}
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-10">
                <button onClick={toggleSelectAll} className="text-neutral-400 hover:text-neutral-700">
                  {selected.size === items.length && items.length > 0 ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th
                className="cursor-pointer select-none hover:text-black"
                onClick={() => handleSort('product_title')}
              >
                Sản phẩm <SortIcon col="product_title" />
              </th>
              <th
                className="cursor-pointer select-none hover:text-black"
                onClick={() => handleSort('sku')}
              >
                SKU <SortIcon col="sku" />
              </th>
              <th>Size / Màu</th>
              <th
                className="cursor-pointer select-none hover:text-black text-right"
                onClick={() => handleSort('price')}
              >
                Giá bán <SortIcon col="price" />
              </th>
              <th className="text-right">Giá nhập (50%)</th>
              <th
                className="cursor-pointer select-none hover:text-black text-right"
                onClick={() => handleSort('stock_qty')}
              >
                Tồn kho <SortIcon col="stock_qty" />
              </th>
              <th className="text-right">Giá trị kho</th>
              <th className="text-center">Ngưỡng</th>
              <th className="text-center">Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-16 text-center text-neutral-400">
                  Không có dữ liệu phù hợp
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.variantId}
                  className={`${
                    selected.has(item.variantId) ? 'bg-blue-50/50' : ''
                  } ${item.isSoldOut ? 'row-danger' : item.isLowStock ? 'row-warning' : ''}`}
                >
                  <td>
                    <button
                      onClick={() => toggleSelect(item.variantId)}
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      {selected.has(item.variantId) ? (
                        <CheckSquare size={16} className="text-blue-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>
                  <td>
                    <a
                      href={`/admin/products/${item.productId}`}
                      className="admin-table-product"
                    >
                      <span className="line-clamp-1">{item.productTitle}</span>
                      <ExternalLink size={11} className="shrink-0" />
                    </a>
                  </td>
                  <td className="admin-table-mono text-xs">{item.sku}</td>
                  <td>
                    <span className="admin-badge-size">{item.size}</span>
                    <span
                      className="inline-flex items-center gap-1 ml-1 rounded px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: item.colorHex + '22',
                        color: '#444',
                        border: `1px solid ${item.colorHex}55`,
                      }}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      {item.colorName}
                    </span>
                  </td>
                  <td className="text-right text-sm">{formatVND(item.price)}</td>
                  <td className="text-right text-sm text-neutral-500">{formatVND(item.costPrice)}</td>
                  <td className="text-right">
                    <span
                      className={`inline-flex items-center justify-center min-w-[2.5rem] rounded-lg px-2 py-1 text-sm font-black ${
                        item.isSoldOut
                          ? 'bg-red-100 text-red-700'
                          : item.isLowStock
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.stockQty}
                    </span>
                  </td>
                  <td className="text-right text-sm text-neutral-500">
                    {formatVND(item.stockValue)}
                  </td>
                  <td className="text-center text-sm text-neutral-500">{item.threshold}</td>
                  <td className="text-center">
                    {item.isSoldOut ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        Hết hàng
                      </span>
                    ) : item.isLowStock ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Sắp hết
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Còn hàng
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingVariant(item)}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      title="Cập nhật tồn kho"
                    >
                      <Edit3 size={13} />
                      Nhập kho
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total} SKU
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
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
                    p === page
                      ? 'bg-black text-white'
                      : 'border border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page === totalPages}
              className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {editingVariant && (
        <InventoryMovementModal
          variant={editingVariant}
          onClose={() => setEditingVariant(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}
