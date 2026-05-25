import { NextRequest } from 'next/server';
import { isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/admin/orders/export?status=&search=
export async function GET(request: NextRequest) {
  if (!isSupabaseMode()) {
    return new Response('Supabase not configured', { status: 503 });
  }

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  try {
    const db = createAdminClient();
    
    let query = db
      .from('orders')
      .select(`
        order_number,
        status,
        total,
        created_at,
        shipping_address,
        order_items (product_title, variant_size, variant_color, quantity, unit_price)
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) {
      const escaped = search.replace(/[\\%_]/g, '\\$&');
      const like = `%${escaped}%`;

      const { data: matchedProfiles } = await db
        .from('profiles')
        .select('user_id')
        .or(`full_name.ilike.${like},phone.ilike.${like}`);

      const userIds = (matchedProfiles ?? [])
        .map((p: any) => p.user_id)
        .filter(Boolean);

      const orFilters = [`order_number.ilike.${like}`];
      if (userIds.length > 0) {
        const quotedIds = userIds.map((id: string) => `\"${id}\"`).join(',');
        orFilters.push(`user_id.in.(${quotedIds})`);
      }

      query = query.or(orFilters.join(','));
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    // Generate CSV
    const headers = [
      'Mã đơn',
      'Trạng thái',
      'Khách hàng',
      'Email',
      'SĐT',
      'Địa chỉ',
      'Sản phẩm',
      'Tổng tiền',
      'Ngày đặt'
    ];

    const STATUS_LABELS: Record<string, string> = {
      pending_payment: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
      refunded: 'Đã hoàn tiền',
    };

    const rows = (orders ?? []).map((order: any) => {
      const address = (order.shipping_address ?? {}) as {
        name?: string;
        phone?: string;
        address?: string;
        city?: string;
        email?: string;
      };

      const items = (order.order_items ?? []).map((item: any) => 
        `${item.product_title} (${item.variant_size || ''}/${item.variant_color || ''}) x${item.quantity}`
      ).join('; ');

      return [
        order.order_number,
        STATUS_LABELS[order.status] || order.status,
        address.name || '',
        address.email || '',
        address.phone || '',
        `${address.address || ''}, ${address.city || ''}`,
        `"${items}"`,
        order.total,
        new Date(order.created_at).toLocaleString('vi-VN')
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    console.error(e);
    return new Response('Export failed', { status: 500 });
  }
}
