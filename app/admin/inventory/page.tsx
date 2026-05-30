import { isSupabaseMode } from '@/lib/api/response';
import { InventoryService } from '@/lib/server/catalog/inventory.service';
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import InventoryDashboard from '@/components/admin/inventory-dashboard';

export const metadata = { title: 'Tồn kho — Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const isSupa = isSupabaseMode();

  type LowStockArr = Awaited<ReturnType<InventoryService['getLowStockVariants']>>;
  type AllStockResult = Awaited<ReturnType<InventoryService['getAllVariantsStock']>>;
  type SummaryResult = Awaited<ReturnType<InventoryService['getInventorySummary']>>;
  type MovementsResult = Awaited<ReturnType<InventoryService['getMovementsFiltered']>>;

  let soldOut: LowStockArr = [];
  let lowStock: LowStockArr = [];
  let globalThreshold = 5;
  let allStock: AllStockResult = { items: [], total: 0 };
  let summary: SummaryResult | null = null;
  let movements: MovementsResult = { items: [], total: 0 };

  if (isSupa) {
    const service = new InventoryService();
    [soldOut, lowStock, globalThreshold, allStock, summary, movements] = await Promise.all([
      service.getLowStockVariants().then((all) => all.filter((a) => a.isSoldOut)),
      service.getLowStockVariants().then((all) => all.filter((a) => !a.isSoldOut)),
      service.getGlobalThreshold(),
      service.getAllVariantsStock({ page: 1, pageSize: 50 }),
      service.getInventorySummary(),
      service.getMovementsFiltered({ page: 1, pageSize: 50 }),
    ]);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý tồn kho</h1>
          <p className="admin-page-subtitle">
            Ngưỡng cảnh báo: <strong>{globalThreshold} sản phẩm</strong>
            {summary && (
              <>
                {' · '}
                <span className="text-neutral-600">
                  {summary.activeVariants} SKU đang hoạt động
                </span>
              </>
            )}
          </p>
        </div>
        <div className="admin-page-actions">
          <a href="/admin/inventory" className="admin-btn admin-btn-secondary">
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
        <div className="admin-notice mb-6">
          <AlertTriangle size={16} />
          Chế độ Mock — kết nối Supabase để xem dữ liệu tồn kho thực. KPI và bảng tồn kho sẽ hiển thị đầy đủ sau khi kết nối.
        </div>
      )}

      <InventoryDashboard
        summary={summary}
        allStock={allStock}
        soldOut={soldOut}
        lowStock={lowStock}
        movements={movements}
        globalThreshold={globalThreshold}
        isSupa={isSupa}
      />
    </div>
  );
}
