import { isSupabaseMode } from '@/lib/api/response';
import { createAdminClient } from '@/lib/supabase/admin';
import { Truck, Plus, Edit } from 'lucide-react';
import { ShippingZoneModal } from '@/components/admin/shipping-zone-modal';
import { ShippingZoneModalButton } from '@/components/admin/shipping-zone-modal-button';
import { ShippingZoneDeleteButton } from '@/components/admin/shipping-zone-delete-button';

export const metadata = { title: 'Vận chuyển — Admin B&D' };
export const dynamic = 'force-dynamic';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default async function AdminShippingPage() {
  const isSupa = isSupabaseMode();
  let zones: any[] = [];

  if (isSupa) {
    const db = createAdminClient();
    const { data } = await db
      .from('shipping_zones')
      .select('*')
      .order('created_at', { ascending: true });
    zones = data ?? [];
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Cấu hình vận chuyển</h1>
          <p className="admin-page-subtitle">Quản lý khu vực giao hàng và phí vận chuyển</p>
        </div>
        <div className="admin-page-actions">
          <ShippingZoneModalButton isEdit={false} zone={null} />
        </div>
      </div>

      <div className="admin-card">
        {zones.length === 0 ? (
          <div className="admin-empty-state">
            <Truck size={48} />
            <h3>Chưa cấu hình vận chuyển</h3>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên khu vực</th>
                  <th>Phạm vi</th>
                  <th>Phí giao hàng</th>
                  <th>Miễn phí từ</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {zones.map((z) => (
                  <tr key={z.id}>
                    <td className="font-medium">{z.name}</td>
                    <td className="text-sm text-gray-600">
                      {z.provinces && z.provinces.length > 0 
                        ? z.provinces.join(', ')
                        : 'Mặc định (Các tỉnh thành khác)'}
                    </td>
                    <td className="font-medium text-orange-600">
                      {z.fee === 0 ? 'Miễn phí' : formatVND(z.fee)}
                    </td>
                    <td>
                      {z.free_above ? formatVND(z.free_above) : <span className="text-gray-400">—</span>}
                    </td>
                    <td>
                      {z.published ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <ShippingZoneModalButton isEdit={true} zone={z} />
                        <ShippingZoneDeleteButton zoneId={z.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
