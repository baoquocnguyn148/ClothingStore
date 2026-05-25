'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface ProductDeleteButtonProps {
  productId: string;
  productTitle: string;
  compact?: boolean;
}

export function ProductDeleteButton({
  productId,
  productTitle,
  compact = false,
}: ProductDeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Xoa san pham "${productTitle}"?\n\nSan pham se bi an khoi storefront va cac bien the se ngung ban.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error ?? 'Khong the xoa san pham');
      }

      router.refresh();
      if (!compact) {
        router.push('/admin/products');
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Khong the xoa san pham');
    } finally {
      setDeleting(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="admin-btn-icon admin-btn-danger disabled:opacity-50"
        aria-label="Xoa san pham"
        title="Xoa san pham"
      >
        <Trash2 size={16} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="admin-btn admin-btn-danger disabled:opacity-50"
    >
      <Trash2 size={16} /> {deleting ? 'Dang xoa...' : 'Xoa san pham'}
    </button>
  );
}
