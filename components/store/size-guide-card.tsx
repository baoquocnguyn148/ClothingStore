'use client';

import Link from 'next/link';
import { Ruler } from 'lucide-react';

const sizeRows = [
  {
    size: 'S',
    height: 'Dưới 1m65',
    weight: '52 - 59kg',
    chest: '105',
    waist: '104',
    hem: '106',
    length: '72',
    sleeveShort: '22',
    sleeveLong: '61,5',
  },
  {
    size: 'M',
    height: '1m65 - 1m75',
    weight: '60 - 65kg',
    chest: '109',
    waist: '108',
    hem: '110',
    length: '73,5',
    sleeveShort: '23',
    sleeveLong: '62,5',
  },
  {
    size: 'L',
    height: '1m65 - 1m75',
    weight: '66 - 71kg',
    chest: '113',
    waist: '112',
    hem: '114',
    length: '75',
    sleeveShort: '24',
    sleeveLong: '63,5',
  },
  {
    size: 'XL',
    height: '1m75 - 1m85',
    weight: '72 - 77kg',
    chest: '117',
    waist: '116',
    hem: '118',
    length: '76,5',
    sleeveShort: '25',
    sleeveLong: '64,5',
  },
  {
    size: 'XXL',
    height: '1m75 - 1m85',
    weight: '78 - 83kg',
    chest: '121',
    waist: '120',
    hem: '122',
    length: '78',
    sleeveShort: '26',
    sleeveLong: '65,5',
  },
];

export function SizeGuideCard() {
  return (
    <div className="mb-8 overflow-hidden rounded-[24px] border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Hướng dẫn chọn size</p>
          <h2 className="mt-2 text-xl font-semibold text-black">Chọn size sơ mi chuẩn</h2>
        </div>
        <Link
          href="/pages/size-guide"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
        >
          <Ruler size={16} /> Xem bảng size chi tiết
        </Link>
      </div>
      <div className="border-t border-border bg-slate-50 p-5 text-sm text-gray-600">
        <div className="grid gap-3 md:grid-cols-2">
          <p><strong className="font-semibold text-black">Gợi ý chọn size:</strong> nếu bạn thích form vừa vặn, chọn theo chiều cao và cân nặng. Nếu thích mặc rộng, có thể lên 1 size.</p>
          <p><strong className="font-semibold text-black">Lưu ý:</strong> bảng size này áp dụng cho Sơ mi Form Classic. Kết quả có thể khác nhau tùy từng mẫu và phong cách mặc.</p>
        </div>
      </div>
    </div>
  );
}
