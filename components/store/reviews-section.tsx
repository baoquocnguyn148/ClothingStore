import Link from 'next/link';
import { Star } from 'lucide-react';
import type { HomeContentMap } from '@/lib/home-content/defaults';
import { getHomeText } from '@/lib/home-content/defaults';

interface ReviewsSectionProps {
  content: HomeContentMap;
}

const mockReviews = [
  { id: 1, author: 'Nguyễn Văn A', text: 'Chất vải rất đẹp, form áo chuẩn. Giao hàng cực kỳ nhanh chóng.', rating: 5 },
  { id: 2, author: 'Trần Thị B', text: 'Thiết kế đơn giản nhưng rất tinh tế, phù hợp mặc hàng ngày.', rating: 5 },
  { id: 3, author: 'Lê Hoàng C', text: 'Sẽ tiếp tục ủng hộ B&D. Dịch vụ chăm sóc khách hàng rất tốt.', rating: 5 },
];

export function ReviewsSection({ content }: ReviewsSectionProps) {
  return (
    <section className="w-full bg-[#fbfbfa] py-20 md:py-32">
      <div className="container-mqb">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-center">
          
          {/* Summary Column */}
          <div className="text-center lg:text-left">
            <h2 className="text-heading-lg uppercase mb-6 text-black">
              {getHomeText(content, 'reviews.title')}
            </h2>
            <div className="flex justify-center lg:justify-start gap-1.5 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={28} className="fill-[#FFB800] text-[#FFB800]" />
              ))}
            </div>
            <div className="flex items-baseline justify-center lg:justify-start gap-3 mb-3">
              <p className="text-5xl md:text-6xl font-black tracking-tighter text-black">
                {getHomeText(content, 'reviews.score')}
              </p>
              <span className="text-2xl font-bold text-gray-400">/ 5</span>
            </div>
            <p className="text-gray-500 font-medium mb-8 text-lg">
              {getHomeText(content, 'reviews.count_label')}
            </p>
            <Link
              href={getHomeText(content, 'reviews.cta_href')}
              className="btn-primary"
            >
              {getHomeText(content, 'reviews.cta')}
            </Link>
          </div>

          {/* Reviews Cards Column */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockReviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#FFB800] text-[#FFB800]" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 line-clamp-4">
                  "{review.text}"
                </p>
                <p className="font-bold text-sm uppercase tracking-wide text-black">
                  {review.author}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
