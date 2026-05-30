import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseMode } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-helper';
import { InventoryService } from '@/lib/server/catalog/inventory.service';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

// GET /api/admin/inventory/export?status=all&search=
export async function GET(request: NextRequest) {
  if (!isSupabaseMode()) {
    return new NextResponse('Supabase not configured', { status: 503 });
  }

  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? undefined;
  const status = (searchParams.get('status') ?? 'all') as 'all' | 'in-stock' | 'low-stock' | 'sold-out';

  try {
    const service = new InventoryService();
    const { items } = await service.getAllVariantsStock({
      search,
      status,
      page: 1,
      pageSize: 9999,
    });

    // Build CSV
    const headers = [
      'SKU',
      'Sản phẩm',
      'Size',
      'Màu sắc',
      'Giá bán (VNĐ)',
      'Giá nhập (VNĐ)',
      'Tồn kho',
      'Giá trị kho (VNĐ)',
      'Ngưỡng cảnh báo',
      'Trạng thái',
    ];

    const rows = items.map((item) => [
      item.sku,
      `"${item.productTitle.replace(/"/g, '""')}"`,
      item.size,
      `"${item.colorName.replace(/"/g, '""')}"`,
      item.price,
      item.costPrice,
      item.stockQty,
      item.stockValue,
      item.threshold,
      item.isSoldOut ? 'Hết hàng' : item.isLowStock ? 'Sắp hết' : 'Còn hàng',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse('\uFEFF' + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inventory_${date}.csv"`,
      },
    });
  } catch (e) {
    return new NextResponse(e instanceof Error ? e.message : 'Failed', { status: 500 });
  }
}
