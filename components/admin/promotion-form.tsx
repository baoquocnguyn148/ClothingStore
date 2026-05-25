'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PromotionFormProps {
  promotion?: any;
  isEdit?: boolean;
}

export function PromotionForm({ promotion, isEdit = false }: PromotionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: promotion?.name || '',
    code: promotion?.code || '',
    description: promotion?.description || '',
    type: promotion?.type || 'percentage',
    apply_mode: promotion?.apply_mode || 'code',
    value: promotion?.value || 0,
    max_discount: promotion?.max_discount || '',
    min_order_value: promotion?.min_order_value || 0,
    min_qty: promotion?.min_qty || 1,
    max_uses: promotion?.max_uses || '',
    starts_at: promotion?.starts_at || '',
    expires_at: promotion?.expires_at || '',
    published: promotion?.published !== undefined ? promotion.published : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = isEdit 
        ? `/api/admin/promotions/${promotion.id}`
        : '/api/admin/promotions';
      
      const method = isEdit ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        max_discount: formData.max_discount ? Number(formData.max_discount) : null,
        max_uses: formData.max_uses ? Number(formData.max_uses) : null,
        value: Number(formData.value),
        min_order_value: Number(formData.min_order_value),
        min_qty: Number(formData.min_qty),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || result?.error || 'Lỗi không xác định');
      }

      setMessage({ type: 'success', text: isEdit ? 'Đã cập nhật khuyến mãi' : 'Đã tạo khuyến mãi' });
      
      setTimeout(() => {
        router.push('/admin/promotions');
        router.refresh();
      }, 1000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Lỗi không xác định' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
      <div className="col-span-2 flex flex-col gap-6">
        <div className="admin-card">
          <h2 className="admin-card-title">Thông tin chung</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên chương trình *</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-sm"
                placeholder="VD: Khuyến mãi hè 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mã (Code)</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-sm font-mono"
                placeholder="Để trống nếu tự động áp dụng"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Khách hàng cần nhập mã này ở bước thanh toán để được giảm giá.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea
                className="w-full p-2 border rounded text-sm h-20"
                placeholder="Mô tả chi tiết chương trình..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">Thiết lập giảm giá</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Loại khuyến mãi</label>
              <select
                className="w-full p-2 border rounded text-sm"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed_amount">Số tiền cố định (VND)</option>
                <option value="free_shipping">Miễn phí vận chuyển</option>
                <option value="buy_x_get_y">Mua X tặng Y</option>
                <option value="custom">Quy tắc tùy chỉnh (Advanced)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mức giảm</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded text-sm"
                  placeholder="VD: 15"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giảm tối đa (VND)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded text-sm"
                  placeholder="VD: 100000"
                  value={formData.max_discount}
                  onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="admin-card">
          <h2 className="admin-card-title">Điều kiện áp dụng</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Đơn hàng tối thiểu (VND)</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm"
                value={formData.min_order_value}
                onChange={(e) => setFormData({ ...formData, min_order_value: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số lượng SP tối thiểu</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm"
                value={formData.min_qty}
                onChange={(e) => setFormData({ ...formData, min_qty: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">Giới hạn sử dụng</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tổng lượt dùng tối đa</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm"
                placeholder="Để trống nếu không giới hạn"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">Thời gian</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bắt đầu</label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded text-sm"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kết thúc</label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded text-sm"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">Trạng thái</h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-sm">Đăng bài (Active)</label>
          </div>
        </div>
      </div>

      <div className="col-span-3 flex items-center justify-between gap-4">
        {!isEdit && (
          <Link href="/admin/promotions" className="admin-btn admin-btn-secondary">
            <ArrowLeft size={16} /> Quay lại
          </Link>
        )}
        {message && (
          <div className={`px-4 py-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="admin-btn admin-btn-primary"
        >
          <Save size={16} /> {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Lưu khuyến mãi')}
        </button>
      </div>
    </form>
  );
}
