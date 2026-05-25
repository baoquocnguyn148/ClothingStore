import ReviewModerationTable from '@/components/admin/review-moderation-table';

export const metadata = { title: 'Đánh giá — Admin B&D' };
export const dynamic = 'force-dynamic';

export default function AdminReviewsPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý đánh giá</h1>
          <p className="admin-page-subtitle">Duyệt và phản hồi các đánh giá sản phẩm.</p>
        </div>
      </div>

      <ReviewModerationTable />
    </div>
  );
}
