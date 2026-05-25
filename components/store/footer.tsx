import Link from 'next/link';
import { BRAND } from '@/lib/brand';

const contactLinks = [
  { label: 'Liên hệ', href: '/pages/contact' },
  { label: `${BRAND.fullName} Membership`, href: '/pages/membership' },
  { label: 'Easy shopping', href: '/pages/easy-shopping' },
];

const supportLinks = [
  { label: 'Hướng dẫn đo size', href: '/pages/size-guide' },
  { label: 'Chính sách đổi trả', href: '/pages/returns' },
  { label: 'Chính sách vận chuyển', href: '/pages/shipping' },
  { label: 'Chính sách bảo hành', href: '/pages/warranty' },
  { label: 'Hướng dẫn mua hàng', href: '/pages/purchase-guide' },
  { label: 'Hướng dẫn bảo quản', href: '/pages/care-guide' },
  { label: 'Chính sách bảo mật', href: '/pages/privacy' },
];

const expandLinks = [
  { label: 'Outfit', href: '/blog' },
  { label: 'Cửa hàng', href: '/about-us#stores' },
];

const stores = [
  '842 Sư Vạn Hạnh, Hòa Hưng, Hồ Chí Minh',
  'Tầng B2, Vincom Đồng Khởi, Bến Nghé, Hồ Chí Minh',
  '139 Nguyễn Trãi, Bến Thành, Hồ Chí Minh',
  '45 Mậu Thân, Ninh Kiều, Cần Thơ',
  '128 Phan Trung, Tam Hiệp, Đồng Nai',
];

export function Footer() {
  return (
    <footer className="w-full bg-black text-white py-16 md:py-24">
      <div className="container-mqb">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold mb-5 uppercase tracking-wider">Xem ngay</h3>
            <ul className="space-y-2.5 text-sm text-gray-300 leading-relaxed">
              <li>{BRAND.company}</li>
              <li>Mã số doanh nghiệp: 0316737985</li>
              <li>
                Địa chỉ L17-11 Tầng 17, Tòa nhà Vincom Center, 72 Lê Thánh Tôn,
                Phường Sài Gòn, TP.HCM
              </li>
              <li>Điện thoại: 028 888 99 616</li>
              <li>Hotline: {BRAND.hotline}</li>
              <li>Email: {BRAND.emails.business}</li>
              <li>{BRAND.emails.customer}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-5 uppercase tracking-wider">Liên hệ</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {contactLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-5 uppercase tracking-wider">Hỗ trợ</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {supportLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-5 uppercase tracking-wider">Mở rộng</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {expandLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-10">
          <h4 className="text-sm font-bold mb-5 uppercase tracking-wider">Cửa hàng</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm text-gray-400">
            {stores.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} {BRAND.name}. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
