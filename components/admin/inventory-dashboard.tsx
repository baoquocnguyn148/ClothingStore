'use client';

import { useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Activity,
  Warehouse,
} from 'lucide-react';
import type {
  InventoryVariantRow,
  StockAlertItem,
  InventoryMovementRow,
  InventorySummary,
} from '@/lib/server/catalog/inventory.service';
import InventoryTable from './inventory-table';
import InventoryMovementLog from './inventory-movement-log';
import InventoryClient from './inventory-client';

type Tab = 'all' | 'alerts' | 'history';

interface Props {
  summary: InventorySummary | null;
  allStock: { items: InventoryVariantRow[]; total: number };
  soldOut: StockAlertItem[];
  lowStock: StockAlertItem[];
  movements: { items: InventoryMovementRow[]; total: number };
  globalThreshold: number;
  isSupa: boolean;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  variant,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  variant?: 'danger' | 'warning' | 'success' | 'default';
}) {
  const colors = {
    danger: 'text-red-600 bg-red-50 border-red-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
    success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    default: 'text-neutral-700 bg-neutral-50 border-neutral-200',
  };

  const iconColors = {
    danger: 'text-red-500 bg-red-100',
    warning: 'text-amber-500 bg-amber-100',
    success: 'text-emerald-500 bg-emerald-100',
    default: 'text-neutral-500 bg-neutral-100',
  };

  const c = colors[variant ?? 'default'];
  const ic = iconColors[variant ?? 'default'];

  return (
    <div className={`rounded-2xl border p-5 ${c}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${ic}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-semibold opacity-80">{label}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

function formatVND(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' triệu';
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

export default function InventoryDashboard({
  summary,
  allStock,
  soldOut,
  lowStock,
  movements,
  globalThreshold,
  isSupa,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'all', label: 'Tất cả SKU', icon: Warehouse, count: allStock.total },
    {
      key: 'alerts',
      label: 'Cảnh báo',
      icon: AlertTriangle,
      count: soldOut.length + lowStock.length,
    },
    { key: 'history', label: 'Lịch sử biến động', icon: Activity, count: movements.total },
  ];

  return (
    <div>
      {/* KPI Grid */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <KpiCard
            label="Tổng SKU"
            value={summary.activeVariants.toLocaleString('vi-VN')}
            sub={`${summary.totalVariants} tổng`}
            icon={Package}
          />
          <KpiCard
            label="Hết hàng"
            value={summary.soldOutCount}
            sub="SKU cần nhập hàng gấp"
            icon={AlertTriangle}
            variant={summary.soldOutCount > 0 ? 'danger' : 'default'}
          />
          <KpiCard
            label="Sắp hết"
            value={summary.lowStockCount}
            sub={`Ngưỡng: ≤ ${globalThreshold}`}
            icon={AlertTriangle}
            variant={summary.lowStockCount > 0 ? 'warning' : 'default'}
          />
          <KpiCard
            label="Tổng tồn kho"
            value={summary.totalStockQty.toLocaleString('vi-VN')}
            sub="Đơn vị sản phẩm"
            icon={Warehouse}
            variant="success"
          />
          <KpiCard
            label="Giá trị kho (nhập)"
            value={formatVND(summary.totalStockValue)}
            sub={`Bán: ${formatVND(summary.totalSellValue)}`}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="admin-card">
        <div className="flex border-b border-neutral-200 mb-6 -mx-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-black text-black'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${
                      activeTab === tab.key
                        ? 'bg-black text-white'
                        : tab.key === 'alerts' && (soldOut.length > 0 || lowStock.length > 0)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab: All Stock */}
        {activeTab === 'all' && isSupa && (
          <InventoryTable
            initialItems={allStock.items}
            initialTotal={allStock.total}
            globalThreshold={globalThreshold}
          />
        )}

        {activeTab === 'all' && !isSupa && (
          <div className="admin-empty-state">
            <Warehouse size={40} />
            <h3>Chế độ Mock</h3>
            <p>Kết nối Supabase để xem toàn bộ tồn kho</p>
          </div>
        )}

        {/* Tab: Alerts */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {soldOut.length === 0 && lowStock.length === 0 ? (
              <div className="admin-empty-state">
                <Package size={40} />
                <h3>Tồn kho ổn định 🎉</h3>
                <p>Tất cả sản phẩm đều có hàng và trên ngưỡng cảnh báo</p>
              </div>
            ) : (
              <>
                {soldOut.length > 0 && (
                  <div>
                    <h3 className="admin-card-title admin-card-title-danger mb-3 flex items-center gap-2">
                      <Package size={16} /> Hết hàng ({soldOut.length})
                    </h3>
                    <InventoryClient items={soldOut} type="sold-out" />
                  </div>
                )}
                {lowStock.length > 0 && (
                  <div>
                    <h3 className="admin-card-title admin-card-title-warning mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} /> Sắp hết ({lowStock.length})
                    </h3>
                    <InventoryClient items={lowStock} type="low-stock" />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: History */}
        {activeTab === 'history' && isSupa && (
          <InventoryMovementLog
            initialItems={movements.items}
            initialTotal={movements.total}
          />
        )}

        {activeTab === 'history' && !isSupa && (
          <div className="admin-empty-state">
            <Activity size={40} />
            <h3>Chế độ Mock</h3>
            <p>Kết nối Supabase để xem lịch sử biến động</p>
          </div>
        )}
      </div>
    </div>
  );
}
