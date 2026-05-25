export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `${price.toLocaleString('vi-VN')} VND`;
  }
  return `${price} VND`;
}
