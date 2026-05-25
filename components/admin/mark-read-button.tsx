'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface MarkReadButtonProps {
  notificationId: string;
}

export function MarkReadButton({ notificationId }: MarkReadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleMarkRead = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkRead}
      disabled={loading}
      className="admin-btn-icon admin-btn-ghost"
      title="Đánh dấu đã đọc"
    >
      <Check size={16} />
    </button>
  );
}
