'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface ShippingZoneDeleteButtonProps {
  zoneId: string;
  onDeleted?: () => void;
}

export function ShippingZoneDeleteButton({ zoneId, onDeleted }: ShippingZoneDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa khu vực vận chuyển này?');
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/shipping-zones/${zoneId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || result?.error || 'Xóa khu vực thất bại');
      }

      if (onDeleted) onDeleted();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa khu vực thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="admin-btn admin-btn-secondary admin-btn-sm"
      >
        <Trash2 size={16} />
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
