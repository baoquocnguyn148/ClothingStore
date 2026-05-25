import type { PolicyPage } from '@/lib/commerce/types';

export const mockPolicies: PolicyPage[] = [
  {
    slug: 'easy-shopping',
    title: 'Easy shopping',
    content: `<p>B&D® cam kết mang đến trải nghiệm mua sắm dễ dàng, tiện lợi với thông tin sản phẩm rõ ràng và hình ảnh chi tiết.</p>`,
  },
  {
    slug: 'size-guide',
    title: 'Hướng dẫn đo size',
    content: `<div class="text-center mb-8">
  <div class="text-2xl font-black tracking-widest text-black mb-1">B&D®</div>
  <div class="text-xl font-bold tracking-wide text-neutral-800 uppercase">BẢNG SIZE SƠ MI FORM CLASSIC</div>
</div>

<p class="mb-8 text-base text-neutral-600 leading-relaxed text-center">Bảng tư vấn size tham khảo dưới đây dựa trên chiều cao, cân nặng và các số đo cơ bản. Để có lựa chọn chính xác nhất, bạn có thể xem chi tiết thông số từng sản phẩm hoặc liên hệ bộ phận CSKH để được tư vấn thêm.</p>

<div class="not-prose overflow-x-auto w-full rounded-xl border border-neutral-200 shadow-sm mb-8">
  <table class="w-full text-center text-sm border-collapse min-w-[850px]">
    <thead>
      <tr class="bg-black text-white uppercase text-xs tracking-wider font-semibold">
        <th class="py-4 px-3 border border-neutral-800 font-bold w-[7%]">Size</th>
        <th class="py-4 px-3 border border-neutral-800 font-bold w-[13%]">Chiều cao (cm)</th>
        <th class="py-4 px-3 border border-neutral-800 font-bold w-[12%]">Cân nặng (kg)</th>
        <th class="py-4 px-3 border border-neutral-800 font-bold w-[10%]">Vòng ngực</th>
        <th class="py-4 px-3 border border-neutral-800 font-bold w-[10%]">Vòng eo</th>
        <th class="py-4 px-3 border border-neutral-800 font-bold w-[10%]">Vòng gấu</th>
        <th class="py-4 px-3 border border-neutral-800 font-bold w-[10%]">Dài áo</th>
        <th class="py-4 px-3 border border-neutral-800 font-bold w-[14%]">Dài tay (Tay ngắn)</th>
        <th class="py-4 px-3 border border-neutral-800 font-bold w-[14%]">Dài tay (Tay dài)</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-neutral-200 bg-white text-neutral-700">
      <tr class="hover:bg-neutral-50/80 transition-colors">
        <td class="py-4 px-3 border border-neutral-200 font-black text-black bg-neutral-50/50 text-base">S</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-600 font-medium">Dưới 1m65</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-600 font-medium">52 - 59kg</td>
        <td class="py-4 px-3 border border-neutral-200 font-bold text-neutral-900">105</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">104</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">106</td>
        <td class="py-4 px-3 border border-neutral-200 font-bold text-neutral-900">72</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">22</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">61,5</td>
      </tr>
      <tr class="hover:bg-neutral-50/80 transition-colors">
        <td class="py-4 px-3 border border-neutral-200 font-black text-black bg-neutral-50/50 text-base">M</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-600 font-medium">1m65 - 1m75</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-600 font-medium">60 - 65kg</td>
        <td class="py-4 px-3 border border-neutral-200 font-bold text-neutral-900">109</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">108</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">110</td>
        <td class="py-4 px-3 border border-neutral-200 font-bold text-neutral-900">73,5</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">23</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">62,5</td>
      </tr>
      <tr class="hover:bg-neutral-50/80 transition-colors">
        <td class="py-4 px-3 border border-neutral-200 font-black text-black bg-neutral-50/50 text-base">L</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-600 font-medium">1m65 - 1m75</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-600 font-medium">66 - 71kg</td>
        <td class="py-4 px-3 border border-neutral-200 font-bold text-neutral-900">113</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">112</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">114</td>
        <td class="py-4 px-3 border border-neutral-200 font-bold text-neutral-900">75</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">24</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">63,5</td>
      </tr>
      <tr class="hover:bg-neutral-50/80 transition-colors">
        <td class="py-4 px-3 border border-neutral-200 font-black text-black bg-neutral-50/50 text-base">XL</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-600 font-medium">1m75 - 1m85</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-600 font-medium">72 - 77kg</td>
        <td class="py-4 px-3 border border-neutral-200 font-bold text-neutral-900">117</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">116</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">118</td>
        <td class="py-4 px-3 border border-neutral-200 font-bold text-neutral-900">76,5</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">25</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">64,5</td>
      </tr>
      <tr class="hover:bg-neutral-50/80 transition-colors">
        <td class="py-4 px-3 border border-neutral-200 font-black text-black bg-neutral-50/50 text-base">XXL</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-600 font-medium">1m75 - 1m85</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-600 font-medium">78 - 83kg</td>
        <td class="py-4 px-3 border border-neutral-200 font-bold text-neutral-900">121</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">120</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">122</td>
        <td class="py-4 px-3 border border-neutral-200 font-bold text-neutral-900">78</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">26</td>
        <td class="py-4 px-3 border border-neutral-200 text-neutral-500">65,5</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="rounded-xl bg-neutral-50 p-6 border border-neutral-200/80 text-sm text-neutral-600 leading-relaxed shadow-sm">
  <p class="font-bold text-neutral-800 text-base mb-3 flex items-center gap-2">
    <span>📌</span> Hướng dẫn đo & Diễn giải thông số
  </p>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
    <div><strong>• Chiều cao / Cân nặng:</strong> Khoảng gợi ý để form áo lên chuẩn nhất.</div>
    <div><strong>• Vòng ngực:</strong> Đo ngang phần ngực lớn nhất (dưới nách).</div>
    <div><strong>• Vòng eo:</strong> Đo quanh phần nhỏ nhất của bụng.</div>
    <div><strong>• Vòng gấu:</strong> Đo quanh phần lai áo dưới cùng.</div>
    <div><strong>• Dài áo:</strong> Đo từ đỉnh vai xuống hết gấu áo.</div>
    <div><strong>• Dài tay:</strong> Đo từ đường may vai xuống hết cửa tay.</div>
  </div>
  <p class="italic text-neutral-400 mt-4 text-xs">Lưu ý: Bảng size mang tính chất tham khảo chuẩn cho dòng sản phẩm Sơ mi Form Classic của thương hiệu B&D®. Tùy thuộc vào sở thích cá nhân (mặc vừa vặn hay mặc rộng rãi), quý khách có thể chủ động tăng/giảm size cho phù hợp.</p>
</div>`,
  },
  {
    slug: 'shipping',
    title: 'Chính sách vận chuyển',
    content: `<p>Giao hàng toàn quốc. Thời gian giao hàng 2-5 ngày làm việc tùy khu vực. Miễn phí vận chuyển cho đơn từ 1.000.000 VND.</p>`,
  },
  {
    slug: 'returns',
    title: 'Chính sách đổi trả',
    content: `<p>Đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên tem, chưa qua sử dụng. Liên hệ customercare@bd.asia.</p>`,
  },
  {
    slug: 'warranty',
    title: 'Chính sách bảo hành',
    content: `<p>Bảo hành lỗi sản xuất trong 30 ngày kể từ ngày mua.</p>`,
  },
  {
    slug: 'privacy',
    title: 'Chính sách bảo mật',
    content: `<p>Thông tin khách hàng được bảo mật theo quy định pháp luật Việt Nam.</p>`,
  },
  {
    slug: 'purchase-guide',
    title: 'Hướng dẫn mua hàng',
    content: `<p>1. Chọn sản phẩm và size. 2. Thêm vào giỏ. 3. Thanh toán. 4. Nhận hàng.</p>`,
  },
  {
    slug: 'care-guide',
    title: 'Hướng dẫn bảo quản',
    content: `<p>Giặt nhẹ, không tẩy mạnh. Phơi trong bóng râm. Ủi ở nhiệt độ thấp.</p>`,
  },
  {
    slug: 'membership',
    title: 'B&D® Membership',
    content: `<p>Đăng ký thành viên để nhận ưu đãi độc quyền và tích điểm mỗi đơn hàng.</p>`,
  },
];
