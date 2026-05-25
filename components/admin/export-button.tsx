'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  status?: string;
  search?: string;
}

export function ExportButton({ status, search }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/orders/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Xuất file thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="admin-btn admin-btn-secondary"
    >
      <Download size={16} />
      {loading ? 'Đang xuất...' : 'Xuất CSV'}
    </button>
  );
}
