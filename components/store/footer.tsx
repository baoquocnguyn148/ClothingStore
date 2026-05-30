import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { Instagram, Facebook, Youtube } from 'lucide-react';

const contactLinks = [
  { label: 'Liên hệ', href: '/pages/contact' },
  { label: `${BRAND.fullName} Membership`, href: '/pages/membership' },
  { label: 'Tuyển dụng', href: '/careers' },
];

const supportLinks = [
  { label: 'Hướng dẫn đo size', href: '/pages/size-guide' },
  { label: 'Chính sách đổi trả', href: '/pages/returns' },
  { label: 'Chính sách vận chuyển', href: '/pages/shipping' },
  { label: 'Chính sách bảo mật', href: '/pages/privacy' },
];

const stores = [
  '842 Sư Vạn Hạnh, Q.10, HCM',
  'Vincom Đồng Khởi, Q.1, HCM',
  '139 Nguyễn Trãi, Q.1, HCM',
  '45 Mậu Thân, Ninh Kiều, Cần Thơ',
];

export function Footer() {
  return (
    <footer className="w-full bg-black text-white pt-20 pb-10">
      <div className="container-mqb">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-4">
            <h2 className="text-2xl font-black uppercase tracking-widest mb-6">{BRAND.name}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
              Trở thành người đầu tiên nhận thông tin về các bộ sưu tập mới, ưu đãi độc quyền và sự kiện đặc biệt từ {BRAND.fullName}.
            </p>
            <form className="flex mb-8">
              <input 
                type="email" 
                placeholder="Nhập email của bạn..." 
                className="bg-neutral-900 border border-neutral-800 text-white px-4 py-3 rounded-l-md focus:outline-none focus:border-gray-500 w-full text-sm transition-colors"
              />
              <button 
                type="button" 
                className="bg-white text-black font-bold uppercase tracking-wider px-6 py-3 rounded-r-md text-sm hover:bg-gray-200 transition-colors"
              >
                Đăng ký
              </button>
            </form>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-white hover:text-black transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-white hover:text-black transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-white hover:text-black transition-colors" aria-label="Youtube">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
            <div>
              <h4 className="text-xs font-bold mb-6 uppercase tracking-[0.2em] text-gray-500">Về chúng tôi</h4>
              <ul className="space-y-4 text-sm text-gray-300">
                {contactLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-white hover:underline underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-bold mb-6 uppercase tracking-[0.2em] text-gray-500">Hỗ trợ khách hàng</h4>
              <ul className="space-y-4 text-sm text-gray-300">
                {supportLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-white hover:underline underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-xs font-bold mb-6 uppercase tracking-[0.2em] text-gray-500">Cửa hàng</h4>
              <ul className="space-y-4 text-sm text-gray-300">
                {stores.map((s) => (
                  <li key={s} className="leading-relaxed">
                    {s}
                  </li>
                ))}
                <li className="pt-2">
                  <Link href="/about-us#stores" className="font-bold text-white uppercase text-xs tracking-wider border-b border-white pb-0.5 hover:text-gray-300 hover:border-gray-300 transition-colors">
                    Xem tất cả hệ thống
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs text-gray-500 text-center md:text-left leading-relaxed">
            <p className="font-bold text-gray-400 mb-1">CÔNG TY TNHH {BRAND.fullName.toUpperCase()}</p>
            <p>Mã số doanh nghiệp: 0316737985 | Hotline: {BRAND.hotline} | Email: {BRAND.emails.customer}</p>
            <p className="mt-2">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          </div>
          
          <div className="flex gap-2">
            {/* Payment Icons Simulation */}
            {['VISA', 'MASTERCARD', 'ATM', 'COD'].map(method => (
              <span key={method} className="px-3 py-1.5 border border-neutral-800 rounded bg-neutral-900 text-[10px] font-bold text-gray-400 tracking-wider">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
