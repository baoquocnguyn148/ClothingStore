'use client';

import { useState } from 'react';
import type { StockAlertItem } from '@/lib/server/catalog/inventory.service';
import { Package, ExternalLink, Edit3, Check, X } from 'lucide-react';

interface Props {
  items: StockAlertItem[];
  type: 'sold-out' | 'low-stock';
}

export default function InventoryClient({ items, type }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [inputQty, setInputQty] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState(items);

  async function handleUpdateStock(variantId: string) {
    const qty = parseInt(inputQty, 10);
    if (isNaN(qty) || qty < 0) return;

    setLoading(variantId);
    try {
      const res = await fetch(`/api/admin/products/variants/${variantId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty, reason: 'admin_restock' }),
      });

      if (res.ok) {
        setLocalItems((prev) =>
          prev.map((item) =>
            item.variantId === variantId ? { ...item, stockQty: qty, isSoldOut: qty === 0 } : item
          )
        );
        setEditing(null);
        setInputQty('');
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>SKU</th>
            <th>Size / Màu</th>
            <th>Tồn kho</th>
            <th>Ngưỡng</th>
            <th>Nhập thêm</th>
          </tr>
        </thead>
        <tbody>
          {localItems.map((item) => (
            <tr key={item.variantId} className={item.isSoldOut ? 'row-danger' : 'row-warning'}>
              <td>
                <a
                  href={`/admin/products/${item.productId}`}
                  className="admin-table-product"
                >
                  {item.productTitle}
                  <ExternalLink size={12} />
                </a>
              </td>
              <td className="admin-table-mono">{item.sku}</td>
              <td>
                <span className="admin-badge-size">{item.size}</span>
                <span className="admin-badge-color">{item.colorName}</span>
              </td>
              <td>
                <span className={`admin-stock-qty ${item.isSoldOut ? 'sold-out' : 'low'}`}>
                  {item.stockQty}
                </span>
              </td>
              <td className="admin-table-center">{item.threshold}</td>
              <td>
                {editing === item.variantId ? (
                  <div className="admin-inline-edit">
                    <input
                      type="number"
                      min="0"
                      value={inputQty}
                      onChange={(e) => setInputQty(e.target.value)}
                      className="admin-qty-input"
                      placeholder="Số lượng mới"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateStock(item.variantId)}
                      disabled={loading === item.variantId}
                      className="admin-btn-icon admin-btn-success"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => { setEditing(null); setInputQty(''); }}
                      className="admin-btn-icon admin-btn-ghost"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditing(item.variantId); setInputQty(String(item.stockQty)); }}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    <Edit3 size={14} />
                    Nhập hàng
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
