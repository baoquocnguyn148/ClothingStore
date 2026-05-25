'use client';

import { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';

interface ShippingZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone?: any;
  onSuccess: () => void;
}

export function ShippingZoneModal({ isOpen, onClose, zone, onSuccess }: ShippingZoneModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: zone?.name || '',
    provinces: zone?.provinces?.join(', ') || '',
    fee: zone?.fee || 0,
    freeAbove: zone?.free_above ?? zone?.freeAbove ?? '',
    published: zone?.published !== undefined ? zone.published : true,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const provincesArray = formData.provinces
        .split(',')
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);

      const payload = {
        name: formData.name,
        provinces: provincesArray,
        fee: Number(formData.fee),
        freeAbove: formData.freeAbove ? Number(formData.freeAbove) : null,
        published: formData.published,
      };

      const url = zone 
        ? `/api/admin/shipping-zones/${zone.id}`
        : '/api/admin/shipping-zones';
      
      const method = zone ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || result?.error || 'Lỗi không xác định');
      }

      setMessage({ type: 'success', text: zone ? 'Đã cập nhật khu vực' : 'Đã tạo khu vực' });
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {zone ? 'Sửa khu vực vận chuyển' : 'Thêm khu vực vận chuyển'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên khu vực *</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-sm"
              placeholder="VD: Miền Bắc, Miền Nam"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tỉnh/Thành phố</label>
            <textarea
              className="w-full p-2 border rounded text-sm h-24"
              placeholder="Nhập tên tỉnh thành, cách nhau bằng dấu phẩy. Để trống nếu là khu vực mặc định."
              value={formData.provinces}
              onChange={(e) => setFormData({ ...formData, provinces: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">VD: Hà Nội, Hải Phòng, Quảng Ninh</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phí giao hàng (VND) *</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm"
                placeholder="VD: 30000"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Miễn phí từ (VND)</label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm"
                placeholder="Để trống nếu không miễn phí"
                value={formData.freeAbove}
                onChange={(e) => setFormData({ ...formData, freeAbove: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-sm">Đang hoạt động</label>
          </div>

          {message && (
            <div className={`px-4 py-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : (zone ? 'Cập nhật' : 'Thêm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
