import Link from 'next/link';
import { ArrowRight, Briefcase, MapPin, Clock } from 'lucide-react';

export const metadata = {
  title: 'Tuyển dụng | B&D',
};

const jobs = [
  {
    id: 'store-manager',
    title: 'Cửa Hàng Trưởng (Store Manager)',
    type: 'Full-time',
    location: 'TP. Hồ Chí Minh',
    department: 'Retail',
  },
  {
    id: 'sales-associate',
    title: 'Nhân viên Bán hàng (Sales Associate)',
    type: 'Full-time / Part-time',
    location: 'TP. Hồ Chí Minh / Cần Thơ',
    department: 'Retail',
  },
  {
    id: 'content-creator',
    title: 'Content Creator (Fashion & Lifestyle)',
    type: 'Full-time',
    location: 'Văn phòng hội sở (Q.1, TP.HCM)',
    department: 'Marketing',
  },
  {
    id: 'customer-service',
    title: 'Chuyên viên CSKH (Customer Service)',
    type: 'Full-time',
    location: 'Văn phòng hội sở (Q.1, TP.HCM)',
    department: 'Operations',
  },
];

export default function CareersPage() {
  return (
    <div className="container-mqb py-16">
      <div className="max-w-3xl mx-auto mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
          Gia nhập đội ngũ B&D®
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Chúng tôi luôn tìm kiếm những con người đam mê thời trang streetwear, nhiệt huyết và mong muốn tạo ra những giá trị đột phá. Hãy cùng B&D® xây dựng cộng đồng "Dreamers" vững mạnh.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-8 border-b pb-4">
          Vị trí đang tuyển
        </h2>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <Link 
              key={job.id} 
              href={`/careers/${job.id}`}
              className="group block p-6 md:p-8 bg-white border border-gray-200 rounded-2xl hover:border-black hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-black">
                      <Briefcase size={14} /> {job.department}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> {job.type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} /> {job.location}
                    </span>
                  </div>
                </div>
                
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors shrink-0">
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-neutral-900 text-white p-8 md:p-12 rounded-2xl text-center">
          <h3 className="text-2xl font-bold uppercase mb-4">Không tìm thấy vị trí phù hợp?</h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Đừng lo! Hãy gửi CV và Portfolio của bạn về cho chúng tôi. Chúng tôi sẽ liên hệ ngay khi có cơ hội phù hợp với tài năng của bạn.
          </p>
          <a 
            href="mailto:hr@bd.asia"
            className="inline-flex items-center justify-center bg-white text-black font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:bg-gray-200 transition-colors"
          >
            Gửi CV qua Email
          </a>
        </div>
      </div>
    </div>
  );
}
