import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Briefcase, MapPin, Clock, CheckCircle2, Send } from 'lucide-react';
import type { Metadata } from 'next';

interface Job {
  id: string;
  title: string;
  type: string;
  location: string;
  department: string;
  salary: string;
  deadline: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

const jobs: Job[] = [
  {
    id: 'store-manager',
    title: 'Cửa Hàng Trưởng (Store Manager)',
    type: 'Full-time',
    location: 'TP. Hồ Chí Minh',
    department: 'Retail',
    salary: '15 – 25 triệu VNĐ/tháng',
    deadline: '31/07/2026',
    summary:
      'Chịu trách nhiệm toàn bộ hoạt động kinh doanh của cửa hàng: quản lý nhân sự, tồn kho, doanh số và trải nghiệm khách hàng. Đây là vị trí quan trọng trong hệ sinh thái bán lẻ đa kênh của B&D.',
    responsibilities: [
      'Quản lý, đào tạo và phát triển đội ngũ nhân viên bán hàng (5–12 người)',
      'Giám sát và tối ưu hóa doanh số, đạt mục tiêu KPI hàng tháng',
      'Quản lý tồn kho và đặt hàng bổ sung thông qua hệ thống MIS',
      'Đảm bảo tiêu chuẩn trưng bày sản phẩm và trải nghiệm khách hàng',
      'Xử lý khiếu nại, phản hồi khách hàng một cách chuyên nghiệp',
      'Báo cáo kết quả kinh doanh hàng tuần cho Ban Giám đốc',
    ],
    requirements: [
      'Tốt nghiệp Đại học chuyên ngành Kinh tế, Quản trị kinh doanh hoặc tương đương',
      'Tối thiểu 2 năm kinh nghiệm quản lý cửa hàng bán lẻ thời trang',
      'Kỹ năng lãnh đạo, giao tiếp và giải quyết vấn đề xuất sắc',
      'Thành thạo tin học văn phòng và phần mềm quản lý bán hàng',
      'Ưu tiên ứng viên có kinh nghiệm với hệ thống ERP/POS',
    ],
    benefits: [
      'Lương cạnh tranh + thưởng doanh số hàng tháng',
      'Chế độ bảo hiểm đầy đủ theo quy định',
      'Chiết khấu 30% khi mua sản phẩm B&D',
      'Đào tạo chuyên môn và kỹ năng lãnh đạo',
      'Lộ trình thăng tiến rõ ràng lên cấp Regional Manager',
    ],
  },
  {
    id: 'sales-associate',
    title: 'Nhân viên Bán hàng (Sales Associate)',
    type: 'Full-time / Part-time',
    location: 'TP. Hồ Chí Minh / Cần Thơ',
    department: 'Retail',
    salary: '7 – 12 triệu VNĐ/tháng',
    deadline: '31/07/2026',
    summary:
      'Tư vấn và hỗ trợ khách hàng tìm kiếm sản phẩm phù hợp, đảm bảo trải nghiệm mua sắm tuyệt vời tại cửa hàng. Vị trí lý tưởng cho những bạn yêu thích thời trang và giao tiếp với mọi người.',
    responsibilities: [
      'Chào đón và tư vấn khách hàng về sản phẩm, phong cách mix & match',
      'Thực hiện quy trình bán hàng trên hệ thống POS',
      'Duy trì sắp xếp và trưng bày sản phẩm theo tiêu chuẩn của B&D',
      'Hỗ trợ kiểm kê hàng hóa và nhập kho định kỳ',
      'Xây dựng mối quan hệ bền vững với khách hàng thân thiết',
    ],
    requirements: [
      'Tốt nghiệp THPT trở lên',
      'Ngoại hình ưa nhìn, năng động, nhiệt tình',
      'Yêu thích thời trang và xu hướng streetwear',
      'Kỹ năng giao tiếp tốt, thái độ phục vụ chuyên nghiệp',
      'Ưu tiên có kinh nghiệm bán hàng thời trang',
    ],
    benefits: [
      'Lương cơ bản + hoa hồng theo doanh số',
      'Phụ cấp ăn trưa, di chuyển',
      'Chiết khấu 20% khi mua sản phẩm B&D',
      'Môi trường làm việc trẻ trung, năng động',
      'Được trang bị đồng phục làm việc từ B&D',
    ],
  },
  {
    id: 'content-creator',
    title: 'Content Creator (Fashion & Lifestyle)',
    type: 'Full-time',
    location: 'Văn phòng hội sở (Q.1, TP.HCM)',
    department: 'Marketing',
    salary: '12 – 20 triệu VNĐ/tháng',
    deadline: '15/07/2026',
    summary:
      'Sáng tạo nội dung hấp dẫn cho các kênh truyền thông của B&D (Instagram, TikTok, Facebook, Website), phản ánh đúng DNA thương hiệu và xu hướng thời trang hiện đại.',
    responsibilities: [
      'Lên ý tưởng và sản xuất nội dung cho Instagram, TikTok, Facebook',
      'Viết content chuẩn SEO cho blog thời trang trên website',
      'Chụp ảnh và quay video sản phẩm, lookbook theo concept',
      'Phân tích hiệu quả content và đề xuất cải thiện',
      'Phối hợp với team design để tạo visual nhất quán với brand',
    ],
    requirements: [
      'Tốt nghiệp Đại học ngành Marketing, Truyền thông, Báo chí hoặc tương đương',
      'Tối thiểu 1 năm kinh nghiệm content creator trong lĩnh vực thời trang/lifestyle',
      'Portfolio thể hiện khả năng sáng tạo nội dung đa dạng',
      'Thành thạo Photoshop, Lightroom, CapCut hoặc các công cụ chỉnh sửa tương tự',
      'Có tài khoản mạng xã hội cá nhân với lượng follower từ 5K+ là lợi thế',
    ],
    benefits: [
      'Môi trường sáng tạo, không gian làm việc hiện đại',
      'Budget cho trang phục và chụp hình sản phẩm',
      'Chiết khấu 25% khi mua sản phẩm B&D',
      'Tham gia các buổi ra mắt bộ sưu tập, fashion events',
      'Được hỗ trợ phát triển personal brand',
    ],
  },
  {
    id: 'customer-service',
    title: 'Chuyên viên CSKH (Customer Service)',
    type: 'Full-time',
    location: 'Văn phòng hội sở (Q.1, TP.HCM)',
    department: 'Operations',
    salary: '9 – 14 triệu VNĐ/tháng',
    deadline: '31/07/2026',
    summary:
      'Đảm nhận vai trò kết nối trực tiếp với khách hàng qua các kênh online (chat, email, hotline), giải quyết khiếu nại và xây dựng mối quan hệ bền vững với cộng đồng khách hàng của B&D.',
    responsibilities: [
      'Tiếp nhận và xử lý yêu cầu, khiếu nại của khách hàng qua tất cả các kênh',
      'Hỗ trợ theo dõi đơn hàng, đổi trả, hoàn tiền theo chính sách',
      'Ghi nhận phản hồi khách hàng và báo cáo cho bộ phận liên quan',
      'Chăm sóc khách hàng VIP và thành viên hạng cao',
      'Phối hợp với team logistics xử lý sự cố vận chuyển',
    ],
    requirements: [
      'Tốt nghiệp Đại học hoặc Cao đẳng',
      'Giọng nói dễ nghe, khả năng giao tiếp xuất sắc',
      'Kiên nhẫn, khéo léo trong xử lý tình huống',
      'Thành thạo tin học văn phòng, phần mềm CRM',
      'Ưu tiên có kinh nghiệm CSKH trong lĩnh vực thương mại điện tử',
    ],
    benefits: [
      'Lương ổn định + thưởng KPI hàng quý',
      'Được đào tạo kỹ năng xử lý tình huống và quản lý cảm xúc',
      'Chiết khấu 20% khi mua sản phẩm B&D',
      'Bảo hiểm sức khỏe toàn diện',
      'Team building hàng quý, du lịch hàng năm',
    ],
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = jobs.find((j) => j.id === id);
  if (!job) return { title: 'Vị trí tuyển dụng — B&D Fashion' };
  return {
    title: `${job.title} — Tuyển dụng B&D Fashion`,
    description: job.summary,
  };
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <div className="animate-page-fade-in">
      {/* Back */}
      <div className="border-b border-border">
        <div className="container-mqb py-4">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách tuyển dụng
          </Link>
        </div>
      </div>

      <div className="container-mqb py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 pb-10 border-b border-border">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="bg-black text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {job.department}
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                <Clock size={12} /> {job.type}
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                <MapPin size={12} /> {job.location}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
              {job.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{job.summary}</p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-widest mb-1">Mức lương</span>
                <span className="font-bold text-black text-base">{job.salary}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-widest mb-1">Hạn nộp hồ sơ</span>
                <span className="font-bold text-black text-base">{job.deadline}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Responsibilities */}
              <section>
                <h2 className="text-xl font-black uppercase tracking-tight mb-5 flex items-center gap-3">
                  <Briefcase size={20} />
                  Mô tả công việc
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle2 size={18} className="text-black shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Requirements */}
              <section>
                <h2 className="text-xl font-black uppercase tracking-tight mb-5">
                  Yêu cầu ứng viên
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Benefits */}
              <section>
                <h2 className="text-xl font-black uppercase tracking-tight mb-5">
                  Quyền lợi
                </h2>
                <ul className="space-y-3">
                  {job.benefits.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Apply Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="bg-black text-white rounded-2xl p-8">
                  <h3 className="font-black uppercase text-lg mb-2">Ứng tuyển ngay</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Gửi CV và Portfolio của bạn qua email. Chúng tôi sẽ phản hồi trong vòng 3–5 ngày làm việc.
                  </p>
                  <a
                    href={`mailto:hr@bd.asia?subject=Ứng tuyển: ${job.title}&body=Xin chào B%26D Fashion,%0A%0ATôi muốn ứng tuyển vào vị trí ${job.title}.%0A%0ATên:%0APhone:%0AKinh nghiệm:%0A%0ATrân trọng.`}
                    className="flex items-center justify-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-sm px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-colors w-full"
                  >
                    <Send size={16} />
                    Gửi CV qua Email
                  </a>
                  <p className="text-gray-500 text-xs text-center mt-4">hr@bd.asia</p>
                </div>

                <div className="border border-border rounded-2xl p-6">
                  <h4 className="font-bold uppercase text-sm mb-4">Chia sẻ vị trí này</h4>
                  <div className="flex gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://bd-fashion.vercel.app/careers/${job.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 border border-border rounded-lg text-sm font-medium hover:border-black transition-colors"
                    >
                      Facebook
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://bd-fashion.vercel.app/careers/${job.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 border border-border rounded-lg text-sm font-medium hover:border-black transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
