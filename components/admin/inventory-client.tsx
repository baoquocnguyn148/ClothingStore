'use client';

import { useState } from 'react';
import type { StockAlertItem } from '@/lib/server/catalog/inventory.service';
import { ExternalLink, Edit3 } from 'lucide-react';
import { InventoryMovementModal } from './inventory-movement-modal';
import type { InventoryVariantRow } from '@/lib/server/catalog/inventory.service';

interface Props {
  items: StockAlertItem[];
  type: 'sold-out' | 'low-stock';
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

export default function InventoryClient({ items, type }: Props) {
  const [localItems, setLocalItems] = useState(items);
  const [editingItem, setEditingItem] = useState<StockAlertItem | null>(null);

  // Convert StockAlertItem to minimal InventoryVariantRow shape for the modal
  const toVariantRow = (item: StockAlertItem): InventoryVariantRow => ({
    variantId: item.variantId,
    sku: item.sku,
    size: item.size,
    colorName: item.colorName,
    colorHex: '#888888',
    price: 0,
    costPrice: 0,
    stockQty: item.stockQty,
    stockValue: 0,
    isActive: true,
    threshold: item.threshold,
    isSoldOut: item.isSoldOut,
    isLowStock: !item.isSoldOut,
    productId: item.productId,
    productTitle: item.productTitle,
    productHandle: item.productHandle,
  });

  const handleSuccess = (variantId: string, newQty: number) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? { ...item, stockQty: newQty, isSoldOut: newQty === 0 }
          : item
      )
    );
    setEditingItem(null);
  };

  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Size / Màu</th>
              <th className="text-right">Tồn kho</th>
              <th className="text-center">Ngưỡng</th>
              <th></th>
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
                <td className="admin-table-mono text-xs">{item.sku}</td>
                <td>
                  <span className="admin-badge-size">{item.size}</span>
                  <span className="admin-badge-color ml-1">{item.colorName}</span>
                </td>
                <td className="text-right">
                  <span
                    className={`inline-flex items-center justify-center min-w-[2.5rem] rounded-lg px-2 py-1 text-sm font-black ${
                      item.isSoldOut
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.stockQty}
                  </span>
                </td>
                <td className="text-center text-sm text-neutral-500">{item.threshold}</td>
                <td>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    <Edit3 size={13} />
                    Nhập hàng
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <InventoryMovementModal
          variant={toVariantRow(editingItem)}
          onClose={() => setEditingItem(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
