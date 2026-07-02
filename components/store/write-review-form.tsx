'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';

interface WriteReviewFormProps {
  productHandle: string;
  onSuccess?: () => void;
}

export function WriteReviewForm({ productHandle, onSuccess }: WriteReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0 || body.length < 10) return;
    setStatus('loading');
    try {
      const res = await fetch(`/api/v1/products/${productHandle}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, body, author: author.trim() || 'Khách hàng ẩn danh' }),
      });
      if (res.ok) {
        setStatus('success');
        onSuccess?.();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in fade-in duration-300">
        <p className="text-3xl mb-3">🎉</p>
        <p className="font-bold text-green-800 text-lg">Cảm ơn bạn đã đánh giá!</p>
        <p className="text-green-600 text-sm mt-2">
          Đánh giá của bạn đang chờ kiểm duyệt và sẽ hiển thị sớm.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-2xl p-6 md:p-8 space-y-5 border border-gray-200"
    >
      <h3 className="font-bold text-lg text-black">Viết đánh giá của bạn</h3>

      {/* Star rating */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          Đánh giá sao <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${star} sao`}
            >
              <Star
                size={28}
                className={`transition-colors ${
                  star <= (hover || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-500 self-center">
              {['', 'Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
          Tên của bạn
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Để trống nếu muốn ẩn danh"
          maxLength={80}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
        />
      </div>

      {/* Body */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
          Nhận xét của bạn <span className="text-red-500">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none transition-shadow"
          required
          minLength={10}
          maxLength={1000}
        />
        <p className={`text-xs mt-1 ${body.length < 10 ? 'text-red-400' : 'text-gray-400'}`}>
          {body.length}/1000 ký tự {body.length < 10 ? `(cần thêm ${10 - body.length} ký tự)` : ''}
        </p>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          Có lỗi xảy ra. Vui lòng thử lại.
        </p>
      )}

      <button
        type="submit"
        disabled={rating === 0 || body.length < 10 || status === 'loading'}
        className="w-full bg-black text-white font-bold py-3 rounded-xl uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Đang gửi...
          </span>
        ) : (
          'Gửi đánh giá'
        )}
      </button>
    </form>
  );
}
