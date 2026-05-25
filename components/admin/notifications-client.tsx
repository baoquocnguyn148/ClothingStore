'use client';

import { useState } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';

interface NotificationsClientProps {
  unreadCount: number;
}

export function NotificationsClient({ unreadCount }: NotificationsClientProps) {
  const [loading, setLoading] = useState(false);

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {unreadCount > 0 && (
        <button
          onClick={handleMarkAllRead}
          disabled={loading}
          className="admin-btn admin-btn-secondary"
        >
          <CheckCircle2 size={16} />
          {loading ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
        </button>
      )}
      <button
        onClick={() => window.location.reload()}
        className="admin-btn admin-btn-secondary"
      >
        <RefreshCw size={16} />
        Làm mới
      </button>
    </>
  );
}
