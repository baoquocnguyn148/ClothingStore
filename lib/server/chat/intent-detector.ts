export type ChatIntent =
  | 'product_search'
  | 'size_guide'
  | 'style_advice'
  | 'promotion'
  | 'order_tracking'
  | 'shipping_policy'
  | 'return_policy'
  | 'membership'
  | 'general';

export function detectIntent(message: string): ChatIntent {
  const msg = message.toLowerCase();

  if (/đơn hàng|order|mã vận đơn|theo dõi|giao hàng chưa|đơn của tôi|kiểm tra đơn/.test(msg))
    return 'order_tracking';

  if (/giảm giá|khuyến mãi|voucher|\bmã\b|coupon|sale|discount|ưu đãi|deal/.test(msg))
    return 'promotion';

  if (/\bship\b|vận chuyển|phí ship|bao lâu giao|thời gian giao|giao hàng mất|nhanh không|tỉnh|hà nội|hcm/.test(msg))
    return 'shipping_policy';

  if (/đổi|trả hàng|hoàn tiền|refund|return|bảo hành|lỗi|hỏng|không vừa/.test(msg))
    return 'return_policy';

  if (/\bsize\b|\bcỡ\b|\bsố\b|cm|\bkg\b|cân nặng|chiều cao|đo|vừa không|size nào|chọn size|bảng size/.test(msg))
    return 'size_guide';

  if (/mặc gì|phong cách|outfit|mix|kết hợp|phối|đám cưới|công sở|du lịch|thể thao|dạo phố|đi chơi|dịp/.test(msg))
    return 'style_advice';

  if (/thành viên|membership|vip|loyalty|điểm|\btier\b|hạng|đặc quyền|quyền lợi/.test(msg))
    return 'membership';

  if (/áo|quần|váy|đầm|giày|túi|phụ kiện|sản phẩm|tìm|có không|còn không|hàng|bán|mua|giá|chất liệu|màu|collection/.test(msg))
    return 'product_search';

  return 'general';
}

export function extractSearchKeywords(message: string): string {
  // Remove common stop words to get product keywords
  const stopWords = ['tôi', 'muốn', 'mua', 'tìm', 'có', 'không', 'cho', 'là', 'và', 'với', 'bạn', 'ơi', 'hả', 'nhỉ', 'nhé'];
  return message
    .toLowerCase()
    .split(/\s+/)
    .filter(w => !stopWords.includes(w) && w.length > 1)
    .join(' ')
    .slice(0, 100);
}
