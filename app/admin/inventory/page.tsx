import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseMode } from '@/lib/api/response';
import { InventoryService } from '@/lib/server/catalog/inventory.service';
import { AlertTriangle, Package, RefreshCw, Settings } from 'lucide-react';
import InventoryClient from '@/components/admin/inventory-client';

export const metadata = { title: 'Tồn kho — Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const isSupa = isSupabaseMode();

  let soldOut: Awaited<ReturnType<InventoryService['getLowStockVariants']>> = [];
  let lowStock: Awaited<ReturnType<InventoryService['getLowStockVariants']>> = [];
  let globalThreshold = 5;

  if (isSupa) {
    const service = new InventoryService();
    const [all, threshold] = await Promise.all([
      service.getLowStockVariants(),
      service.getGlobalThreshold(),
    ]);
    soldOut = all.filter((a) => a.isSoldOut);
    lowStock = all.filter((a) => !a.isSoldOut);
    globalThreshold = threshold;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý tồn kho</h1>
          <p className="admin-page-subtitle">
            Ngưỡng cảnh báo hiện tại: <strong>{globalThreshold} sản phẩm</strong>
          </p>
        </div>
        <div className="admin-page-actions">
          <a href="/admin/inventory?refresh=1" className="admin-btn admin-btn-secondary">
            <RefreshCw size={16} />
            Làm mới
          </a>
          <a href="/admin/settings/notifications" className="admin-btn admin-btn-secondary">
            <Settings size={16} />
            Cài đặt ngưỡng
          </a>
        </div>
      </div>

      {!isSupa && (
        <div className="admin-notice">
          <AlertTriangle size={16} />
          Chế độ Mock — kết nối Supabase để xem dữ liệu tồn kho thực
        </div>
      )}

      {/* Summary cards */}
      <div className="admin-stat-grid admin-stat-grid-2">
        <div className="admin-stat-card admin-stat-danger">
          <div className="admin-stat-icon">
            <Package size={22} />
          </div>
          <div className="admin-stat-body">
            <p className="admin-stat-value">{soldOut.length}</p>
            <p className="admin-stat-label">Hết hàng (0 sản phẩm)</p>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-warning">
          <div className="admin-stat-icon">
            <AlertTriangle size={22} />
          </div>
          <div className="admin-stat-body">
            <p className="admin-stat-value">{lowStock.length}</p>
            <p className="admin-stat-label">Sắp hết hàng (≤ {globalThreshold})</p>
          </div>
        </div>
      </div>

      {/* Sold out */}
      {soldOut.length > 0 && (
        <div className="admin-card">
          <h2 className="admin-card-title admin-card-title-danger">
            <Package size={18} />
            Hết hàng ({soldOut.length})
          </h2>
          <InventoryClient items={soldOut} type="sold-out" />
        </div>
      )}

      {/* Low stock */}
      {lowStock.length > 0 && (
        <div className="admin-card">
          <h2 className="admin-card-title admin-card-title-warning">
            <AlertTriangle size={18} />
            Sắp hết hàng ({lowStock.length})
          </h2>
          <InventoryClient items={lowStock} type="low-stock" />
        </div>
      )}

      {soldOut.length === 0 && lowStock.length === 0 && isSupa && (
        <div className="admin-card admin-empty-state">
          <Package size={48} />
          <h3>Tồn kho ổn định</h3>
          <p>Tất cả sản phẩm đều có hàng và trên ngưỡng cảnh báo</p>
        </div>
      )}
    </div>
  );
}
