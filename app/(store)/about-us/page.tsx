import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Về chúng tôi — B&D Fashion',
  description:
    'B&D Fashion — thương hiệu thời trang Việt Nam dành cho giới trẻ. Câu chuyện thương hiệu, hệ thống cửa hàng và đội ngũ của chúng tôi.',
};

const milestones = [
  { year: '2018', title: 'Khởi đầu', desc: 'B&D ra đời với cửa hàng đầu tiên tại 842 Sư Vạn Hạnh, TP.HCM. Bắt đầu với 3 nhân viên và niềm đam mê thời trang.' },
  { year: '2020', title: 'Mở rộng online', desc: 'Ra mắt website thương mại điện tử, phục vụ khách hàng toàn quốc. Doanh thu tăng trưởng 200% sau 6 tháng.' },
  { year: '2022', title: 'Chuỗi cửa hàng', desc: 'Mở thêm 3 chi nhánh tại Vincom Đồng Khởi, Nguyễn Trãi và Cần Thơ. Đội ngũ phát triển lên 45 người.' },
  { year: '2024', title: 'Chuyển đổi số', desc: 'Triển khai hệ thống MIS toàn diện — quản lý tồn kho real-time, CRM và phân tích dữ liệu để phục vụ khách hàng tốt hơn.' },
  { year: '2026', title: 'Hôm nay', desc: 'Hơn 50,000 khách hàng trung thành, 5 cửa hàng trên toàn quốc và đội ngũ 80+ người đầy nhiệt huyết.' },
];

const values = [
  {
    icon: '🎯',
    title: 'Chất lượng trên hết',
    desc: 'Mỗi sản phẩm đều trải qua kiểm định chất lượng nghiêm ngặt. Chúng tôi không thỏa hiệp với tiêu chuẩn.',
  },
  {
    icon: '🌱',
    title: 'Bền vững & Trách nhiệm',
    desc: 'Cam kết sử dụng nguyên liệu có nguồn gốc rõ ràng, quy trình sản xuất thân thiện với môi trường.',
  },
  {
    icon: '💡',
    title: 'Sáng tạo không ngừng',
    desc: 'Đội ngũ thiết kế luôn cập nhật xu hướng thế giới và tái hiện chúng theo phong cách Việt.',
  },
  {
    icon: '🤝',
    title: 'Khách hàng là trọng tâm',
    desc: 'Mọi quyết định của chúng tôi đều bắt đầu từ câu hỏi: "Điều này có mang lại giá trị cho khách hàng không?"',
  },
];

const stores = [
  {
    name: '842 Sư Vạn Hạnh',
    address: '842 Sư Vạn Hạnh, Phường Hòa Hưng, Quận 10, TP.HCM',
    phone: '028 3456 7890',
    hours: '9:00 – 22:00 hàng ngày',
    map: 'https://www.google.com/maps',
  },
  {
    name: 'Vincom Đồng Khởi',
    address: 'Tầng B1, Vincom Đồng Khởi, 72 Lê Thánh Tôn, Quận 1, TP.HCM',
    phone: '028 3456 7891',
    hours: '9:30 – 22:00 hàng ngày',
    map: 'https://www.google.com/maps',
  },
  {
    name: '139 Nguyễn Trãi',
    address: '139 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
    phone: '028 3456 7892',
    hours: '9:00 – 21:30 hàng ngày',
    map: 'https://www.google.com/maps',
  },
  {
    name: 'Cần Thơ',
    address: '54 Mậu Thân, Phường Ninh Kiều, TP. Cần Thơ',
    phone: '0292 345 6789',
    hours: '9:00 – 21:00 hàng ngày',
    map: 'https://www.google.com/maps',
  },
  {
    name: 'Đồng Nai',
    address: '128 Phan Trung, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai',
    phone: '0251 345 6789',
    hours: '9:00 – 21:00 hàng ngày',
    map: 'https://www.google.com/maps',
  },
];

const stats = [
  { value: '50K+', label: 'Khách hàng trung thành' },
  { value: '5', label: 'Cửa hàng toàn quốc' },
  { value: '80+', label: 'Thành viên đội ngũ' },
  { value: '2018', label: 'Năm thành lập' },
];

export default function AboutPage() {
  return (
    <div className="animate-page-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[420px] md:min-h-[520px] overflow-hidden bg-black">
        <Image
          src="/images/lifestyle/lifestyle_1.png"
          alt="B&D Fashion — Về chúng tôi"
          fill
          className="object-cover object-center opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 container-mqb h-full flex flex-col justify-end pb-16 pt-32">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">
              B&D Fashion — Est. 2018
            </p>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-6 leading-none">
              Câu chuyện<br />của chúng tôi
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
              Từ một cửa hàng nhỏ tại Sư Vạn Hạnh đến chuỗi thương hiệu thời trang
              được yêu thích, B&D luôn giữ nguyên một niềm tin: thời trang đẹp
              không nhất thiết phải đắt.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-black border-t border-white/10">
        <div className="container-mqb py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-white mb-1">{s.value}</p>
                <p className="text-sm text-gray-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="container-mqb py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Sứ mệnh</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-6 leading-tight">
              Thời trang đẹp<br />cho mọi người trẻ
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-[15px]">
              <p>
                B&D Fashion ra đời từ niềm tin rằng người trẻ Việt xứng đáng được mặc
                những sản phẩm chất lượng cao, thiết kế đẹp mà không cần phải chi trả
                mức giá xa xỉ. Chúng tôi mang xu hướng thời trang thế giới đến gần hơn
                với bạn trẻ Việt Nam.
              </p>
              <p>
                Với đội ngũ thiết kế am hiểu cả thẩm mỹ quốc tế lẫn phong cách sống
                Việt, mỗi bộ sưu tập của B&D là sự kết hợp hài hòa giữa xu hướng toàn
                cầu và bản sắc địa phương.
              </p>
              <p>
                <span className="font-bold text-black">For Dreamers Only</span> — không
                chỉ là slogan, đây là lời cam kết của chúng tôi với những người trẻ
                dám ước mơ và không ngừng theo đuổi phong cách của riêng mình.
              </p>
            </div>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/images/lifestyle/lifestyle_2.png"
              alt="B&D Fashion lifestyle"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container-mqb">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Hành trình</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase">Từng bước trưởng thành</h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[calc(50%-1px)] top-0 bottom-0 w-px bg-gray-200 hidden md:block" />
            <div className="space-y-12">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className={`flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-3xl font-black text-black mb-1">{m.year}</p>
                      <p className="font-bold text-lg mb-2">{m.title}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                  {/* Center dot */}
                  <div className="hidden md:flex w-4 h-4 rounded-full bg-black border-4 border-white shadow-md shrink-0 z-10" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-mqb py-20 md:py-28">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Giá trị cốt lõi</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase">Chúng tôi tin vào điều gì</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v) => (
            <div
              key={v.title}
              className="group border border-gray-200 rounded-2xl p-8 hover:border-black hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <p className="text-4xl mb-5">{v.icon}</p>
              <h3 className="font-black text-lg uppercase mb-3">{v.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stores */}
      <section id="stores" className="bg-black py-20 md:py-28">
        <div className="container-mqb">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Hệ thống</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase text-white">Cửa hàng của chúng tôi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.name}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
              >
                <h3 className="font-black text-white text-lg uppercase mb-4">{store.name}</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-gray-400 text-sm">
                    <MapPin size={15} className="shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <Phone size={15} className="shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <Clock size={15} className="shrink-0" />
                    <span>{store.hours}</span>
                  </div>
                </div>
                <a
                  href={store.map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest hover:gap-3 transition-all duration-200"
                >
                  Xem bản đồ
                  <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-mqb py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">
          Sẵn sàng khám phá?
        </h2>
        <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
          Hãy để B&D đồng hành cùng phong cách của bạn.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/collections" className="btn-primary">
            Khám phá bộ sưu tập
          </Link>
          <Link href="/careers" className="btn-secondary">
            Gia nhập đội ngũ
          </Link>
        </div>
      </section>
    </div>
  );
}
