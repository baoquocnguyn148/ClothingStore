'use client';

import { useEffect, useState } from 'react';
import { Check, X, RefreshCw, ExternalLink } from 'lucide-react';

interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  published: boolean;
  verified: boolean;
  createdAt: string;
  user?: { fullName: string };
  product?: { id: string; title: string; handle: string };
}

const REVIEW_FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang chờ', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
];

export default function ReviewModerationTable() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [message, setMessage] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const url = new URL('/api/admin/reviews', window.location.origin);
      if (filter === 'pending') url.searchParams.set('published', 'false');
      if (filter === 'approved') url.searchParams.set('published', 'true');
      const response = await fetch(url.toString());
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.message || 'Không thể tải đánh giá');
        return;
      }
      setReviews(data.reviews ?? []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const updateReview = async (reviewId: string, published: boolean) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, published }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result?.message || 'Cập nhật thất bại');
        return;
      }
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, published } : review
        )
      );
      setMessage('Cập nhật thành công');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Lỗi mạng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="admin-card-title">Duyệt đánh giá</h2>
          <p className="text-sm text-gray-600">Xem và phê duyệt đánh giá mới từ khách hàng.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {REVIEW_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value as typeof filter)}
              className={`admin-btn admin-btn-sm ${filter === item.value ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={fetchReviews}
            className="admin-btn admin-btn-secondary"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>
      </div>

      {message && <div className="mb-4 text-sm text-gray-700">{message}</div>}

      {loading ? (
        <div className="admin-empty-state">Đang tải...</div>
      ) : reviews.length === 0 ? (
        <div className="admin-empty-state">
          <p>Không có đánh giá phù hợp.</p>
        </div>
      ) : (
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Khách hàng</th>
                <th>Đánh giá</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="max-w-xs">
                    {review.product ? (
                      <a href={`/products/${review.product.handle}`} className="admin-table-product" target="_blank" rel="noreferrer">
                        {review.product.title} <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">Sản phẩm không rõ</span>
                    )}
                  </td>
                  <td>
                    <div className="font-medium">{review.user?.fullName ?? 'Khách'}</div>
                    {review.verified && (
                      <span className="inline-flex items-center px-2 py-1 mt-1 rounded bg-green-100 text-green-700 text-[11px] uppercase">
                        Đã mua
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx}>{idx < review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </td>
                  <td className="max-w-[320px] text-sm text-gray-700">
                    <div className="font-medium mb-1">{review.title ?? 'Không có tiêu đề'}</div>
                    <p className="line-clamp-3">{review.body ?? ''}</p>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${review.published ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {review.published ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="flex gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => updateReview(review.id, true)}
                      className="admin-btn admin-btn-sm admin-btn-success"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => updateReview(review.id, false)}
                      className="admin-btn admin-btn-sm admin-btn-danger"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
