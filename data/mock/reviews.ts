export interface Review {
  id: string;
  product_handle: string;
  author: string;
  rating: number;
  body: string;
  created_at: string;
  approved: boolean;
  avatar_seed?: string;
}

// Generic reviews hiển thị khi không có reviews riêng cho sản phẩm
export const genericReviews: Review[] = [
  {
    id: 'r1',
    product_handle: '',
    author: 'Minh Tuấn',
    rating: 5,
    body: 'Chất vải rất tốt, mặc thoáng mát. Đúng như mô tả, mình rất hài lòng! Sẽ mua thêm lần sau.',
    created_at: '2026-05-15T10:00:00Z',
    approved: true,
    avatar_seed: 'mintuan',
  },
  {
    id: 'r2',
    product_handle: '',
    author: 'Hà Linh',
    rating: 5,
    body: 'Form áo rất đẹp, vừa vặn như ý. Màu sắc y hình, ship nhanh. Highly recommend!',
    created_at: '2026-05-20T14:30:00Z',
    approved: true,
    avatar_seed: 'halinh',
  },
  {
    id: 'r3',
    product_handle: '',
    author: 'Quốc Bảo',
    rating: 4,
    body: 'Áo đẹp, chất ổn. Chỉ tiếc là giao hàng hơi lâu một chút nhưng nhìn chung rất ok.',
    created_at: '2026-06-01T09:00:00Z',
    approved: true,
    avatar_seed: 'quocbao',
  },
  {
    id: 'r4',
    product_handle: '',
    author: 'Thu Hương',
    rating: 5,
    body: 'Mua cho bạn trai, anh ấy rất thích. Chất liệu premium, đường chỉ may kỹ lưỡng.',
    created_at: '2026-06-10T16:00:00Z',
    approved: true,
    avatar_seed: 'thuhuong',
  },
];

// Per-product reviews (populated by Supabase or overridden here for demo)
export const mockReviews: Record<string, Review[]> = {};
