import { BRAND } from '@/lib/brand';

export const metadata = { title: 'About Us' };

const stores = [
  {
    name: '842 Sư Vạn Hạnh',
    address: '842 Sư Vạn Hạnh, Phường Hòa Hưng, TP.HCM',
    map: 'https://www.google.com/maps',
  },
  {
    name: 'Vincom Đồng Khởi',
    address: 'Tầng B1, Vincom Đồng Khởi, 72 Lê Thánh Tôn, TP.HCM',
    map: 'https://www.google.com/maps',
  },
  {
    name: '139 Nguyễn Trãi',
    address: '139 Nguyễn Trãi, Phường Bến Thành, TP.HCM',
    map: 'https://www.google.com/maps',
  },
  {
    name: 'Cần Thơ',
    address: '54 Mậu Thân, Phường Ninh Kiều, Cần Thơ',
    map: 'https://www.google.com/maps',
  },
  {
    name: 'Đồng Nai',
    address: '128 Phan Trung, Phường Tam Hiệp, Đồng Nai',
    map: 'https://www.google.com/maps',
  },
];

export default function AboutPage() {
  return (
    <div className="container-mqb py-12 md:py-16">
      <h1 className="text-heading-lg uppercase mb-8">About {BRAND.name}</h1>
      <div className="max-w-3xl space-y-6 text-secondary leading-relaxed mb-16">
        <p>
          {BRAND.fullName}  EEasy Streetwear. Thương hiệu thời trang streetwear Việt Nam
          dành cho giới trẻ, với sứ mệnh mang xu hướng thời trang thế giới đến
          với bạn trẻ Việt Nam một cách nhanh chóng và tiện lợi.
        </p>
        <p>
          {BRAND.name} tôn vinh những người trẻ đam mê và dám theo đuổi ước mơ  E          FOR DREAMERS ONLY.
        </p>
      </div>

      <section id="stores">
        <h2 className="text-heading-md uppercase mb-8">Cửa hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div
              key={store.name}
              className="border border-border p-6 hover:border-black transition"
            >
              <h3 className="font-bold uppercase mb-2">{store.name}</h3>
              <p className="text-sm text-secondary mb-4">{store.address}</p>
              <a
                href={store.map}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold underline"
              >
                Xem bản đồ
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
