import Link from 'next/link';
import { Star } from 'lucide-react';
import { ReviewService } from '@/lib/server/catalog/review.service';

const mockReviews = [
  { id: '1', author: 'Nguyễn Văn A', text: 'Chất vải rất đẹp, form áo chuẩn.', rating: 5, product: { handle: 'levents-xl-logo-boxy-sweater', title: 'LEVENTS® XL LOGO BOXY SWEATER' } },
  { id: '2', author: 'Trần Thị B', text: 'Thiết kế tinh tế, phù hợp mặc hàng ngày.', rating: 4, product: { handle: 'levents-seasonal-hoodie-boxy', title: 'LEVENTS® SEASONAL HOODIE BOXY' } },
  { id: '3', author: 'Lê Hoàng C', text: 'Dịch vụ nhanh, sẽ mua tiếp.', rating: 5, product: { handle: 'levents-rhinestone-long-sleeve-boxy-tee', title: 'LEVENTS® RHINESTONE LONG SLEEVE BOXY TEE' } },
];

export default async function ReviewsPage() {
  let reviews = [] as any[];
  try {
    const svc = new ReviewService();
    const res = await svc.getAllReviews({ published: true, limit: 24 });
    reviews = res.reviews ?? [];
  } catch (e) {
    // Fall back to mock reviews if Supabase not configured or error
    reviews = mockReviews;
  }

  return (
    <div className="container-mqb py-12 md:py-16">
      <h1 className="text-heading-lg uppercase mb-6">Feedback</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              {[...Array(r.rating || 5)].map((_, i) => (
                <Star key={i} size={16} className="fill-[#FFB800] text-[#FFB800]" />
              ))}
            </div>
            <p className="text-gray-700 mb-4 line-clamp-4">{r.body ?? r.text}</p>
            <p className="font-semibold text-sm">{r.user?.fullName ?? r.author}</p>
            {r.product?.handle && (
              <Link href={`/products/${r.product.handle}`} className="text-sm text-black/70 mt-2 inline-block">
                Xem sản phẩm
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
