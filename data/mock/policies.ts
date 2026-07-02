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
    content: `
      <div class="space-y-6 text-neutral-600">
        <h3 class="text-lg font-bold text-black uppercase tracking-wider">1. Thời gian giao hàng</h3>
        <p>B&D® sử dụng dịch vụ của các đối tác vận chuyển uy tín (GHTK, Viettel Post, Ahamove) để đảm bảo hàng hóa đến tay bạn nhanh nhất:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Nội thành TP.HCM:</strong> Giao nhanh trong 1-2 ngày làm việc. Hỗ trợ giao hỏa tốc 2H-4H.</li>
          <li><strong>Các tỉnh/thành phố khác:</strong> Thời gian giao hàng dao động từ 3-5 ngày làm việc tùy vào khu vực.</li>
        </ul>
        <p class="text-sm italic text-neutral-500">* Lưu ý: Trong các đợt ra mắt bộ sưu tập mới hoặc siêu sale, thời gian giao hàng có thể kéo dài thêm 1-2 ngày do lượng đơn quá tải. Mong quý khách thông cảm.</p>

        <h3 class="text-lg font-bold text-black uppercase tracking-wider mt-8">2. Phí vận chuyển</h3>
        <ul class="list-disc pl-5 space-y-2">
          <li>Đồng giá <strong>30.000 VNĐ</strong> cho mọi đơn hàng giao tiêu chuẩn trên toàn quốc.</li>
          <li><strong>Freeship:</strong> Miễn phí vận chuyển toàn quốc cho tất cả đơn hàng có giá trị từ <strong>1.000.000 VNĐ</strong> trở lên.</li>
        </ul>

        <h3 class="text-lg font-bold text-black uppercase tracking-wider mt-8">3. Quy định nhận hàng</h3>
        <p>Để đảm bảo quyền lợi, quý khách vui lòng <strong>quay video toàn bộ quá trình mở gói hàng (unboxing)</strong> rõ nét, không cắt ghép. Khách hàng được phép đồng kiểm ngoại quan hộp hàng với shipper (không bóc seal sản phẩm, không mặc thử).</p>
      </div>
    `,
  },
  {
    slug: 'returns',
    title: 'Chính sách đổi trả & Bảo hành',
    content: `
      <div class="space-y-6 text-neutral-600">
        <h3 class="text-lg font-bold text-black uppercase tracking-wider">1. Điều kiện đổi trả</h3>
        <p>B&D® luôn muốn bạn hài lòng tuyệt đối với fit và chất lượng sản phẩm. Chúng tôi hỗ trợ đổi trả trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng với các điều kiện sau:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Sản phẩm còn nguyên tag, mạc, hóa đơn mua hàng.</li>
          <li>Sản phẩm chưa qua sử dụng, chưa qua giặt ủi, không có mùi lạ, không bị bẩn hoặc hư hỏng do tác nhân bên ngoài.</li>
          <li>Chỉ áp dụng đổi size hoặc đổi sang sản phẩm khác có giá trị bằng hoặc cao hơn (khách hàng bù phần chênh lệch). Không hỗ trợ hoàn tiền trừ trường hợp lỗi từ nhà sản xuất.</li>
        </ul>
        <p class="text-red-500 text-sm font-semibold mt-2">🚫 KHÔNG áp dụng đổi trả đối với: Sản phẩm SALE từ 30% trở lên, các phụ kiện (vớ, đồ lót, mũ, keychain).</p>

        <h3 class="text-lg font-bold text-black uppercase tracking-wider mt-8">2. Chính sách bảo hành</h3>
        <p>Bảo hành <strong>1 đổi 1 trong 30 ngày</strong> đối với các lỗi kỹ thuật từ nhà sản xuất:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Bung đường chỉ, sút nút.</li>
          <li>Hỏng dây kéo, khóa bấm.</li>
          <li>Hình in bị bong tróc, nứt gãy nghiêm trọng ngay sau lần giặt đầu tiên (đúng theo HDSD).</li>
        </ul>

        <h3 class="text-lg font-bold text-black uppercase tracking-wider mt-8">3. Quy trình đổi trả</h3>
        <ol class="list-decimal pl-5 space-y-2">
          <li>Gửi video unboxing và tình trạng sản phẩm về Fanpage B&D® hoặc Email CSKH.</li>
          <li>Đội ngũ CSKH sẽ kiểm tra và xác nhận điều kiện đổi trả trong 24H.</li>
          <li>Đóng gói cẩn thận và gửi sản phẩm về kho B&D® theo địa chỉ được cung cấp.</li>
          <li>B&D® nhận hàng, kiểm định và tiến hành gửi lại sản phẩm mới cho quý khách. Phí vận chuyển chiều đi khách hàng tự chi trả, B&D® sẽ chịu phí vận chuyển chiều gửi lại (trường hợp đổi size). Lỗi NSX sẽ được miễn phí 100% phí ship.</li>
        </ol>
      </div>
    `,
  },
  {
    slug: 'privacy',
    title: 'Chính sách bảo mật',
    content: `
      <div class="space-y-4 text-neutral-600">
        <p>Sự riêng tư của khách hàng là ưu tiên hàng đầu tại B&D®. Chúng tôi cam kết bảo vệ an toàn thông tin cá nhân của bạn.</p>
        <h3 class="text-base font-bold text-black mt-6">Mục đích thu thập</h3>
        <p>Thông tin (Tên, SĐT, Địa chỉ, Email) chỉ được thu thập nhằm mục đích xử lý đơn hàng, giao hàng, hỗ trợ bảo hành và gửi thông báo về các ưu đãi đặc quyền (nếu bạn cho phép).</p>
        <h3 class="text-base font-bold text-black mt-6">Cam kết bảo mật</h3>
        <p>Tuyệt đối KHÔNG bán, chia sẻ hay trao đổi thông tin khách hàng cho bên thứ ba vì mục đích thương mại. Dữ liệu thanh toán của bạn được mã hóa an toàn thông qua các cổng thanh toán uy tín (VNPay, MoMo) đạt chuẩn bảo mật quốc tế PCI DSS.</p>
      </div>
    `,
  },
  {
    slug: 'membership',
    title: 'B&D® Membership',
    content: `
      <div class="space-y-8 text-neutral-600">
        <div class="text-center">
          <p class="text-lg mb-2">Chương trình Khách Hàng Thân Thiết</p>
          <h2 class="text-3xl font-black uppercase text-black">The Dreamers Club</h2>
        </div>
        
        <p class="text-center">Tích lũy chi tiêu để thăng hạng và tận hưởng những đặc quyền thiết kế riêng cho bạn.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div class="bg-neutral-100 p-6 rounded-xl border-l-4 border-gray-400">
            <h3 class="text-xl font-black text-black mb-2 uppercase">Member</h3>
            <p class="text-sm font-semibold mb-4 text-neutral-500">Chi tiêu dưới 5.000.000đ</p>
            <ul class="list-disc pl-4 space-y-2 text-sm">
              <li>Tích lũy điểm thưởng mỗi lần mua sắm (10.000đ = 1 điểm).</li>
              <li>Sử dụng điểm để đổi Voucher giảm giá.</li>
            </ul>
          </div>
          
          <div class="bg-gradient-to-br from-neutral-200 to-neutral-300 p-6 rounded-xl border-l-4 border-neutral-500">
            <h3 class="text-xl font-black text-black mb-2 uppercase">Silver</h3>
            <p class="text-sm font-semibold mb-4 text-neutral-700">Chi tiêu từ 5.000.000đ</p>
            <ul class="list-disc pl-4 space-y-2 text-sm">
              <li><strong>Giảm 5%</strong> cho mọi đơn hàng (không áp dụng cùng CTKM khác).</li>
              <li>Voucher 10% trong tháng sinh nhật.</li>
              <li>Quà tặng độc quyền B&D Merchandise.</li>
            </ul>
          </div>

          <div class="bg-gradient-to-br from-yellow-100 to-yellow-300 p-6 rounded-xl border-l-4 border-yellow-500">
            <h3 class="text-xl font-black text-yellow-900 mb-2 uppercase">Gold</h3>
            <p class="text-sm font-semibold mb-4 text-yellow-800">Chi tiêu từ 15.000.000đ</p>
            <ul class="list-disc pl-4 space-y-2 text-sm">
              <li><strong>Giảm 10%</strong> cho mọi đơn hàng.</li>
              <li>Freeship mọi đơn hàng toàn quốc.</li>
              <li>Voucher 15% trong tháng sinh nhật.</li>
              <li><strong>Early Access:</strong> Được quyền mua sớm 24H các Bộ sưu tập mới nhất.</li>
            </ul>
          </div>

          <div class="bg-gradient-to-br from-neutral-800 to-black p-6 rounded-xl border-l-4 border-neutral-400 text-white">
            <h3 class="text-xl font-black mb-2 uppercase text-white">Platinum</h3>
            <p class="text-sm font-semibold mb-4 text-neutral-300">Chi tiêu từ 30.000.000đ</p>
            <ul class="list-disc pl-4 space-y-2 text-sm text-neutral-200">
              <li><strong>Giảm 15%</strong> cho mọi đơn hàng.</li>
              <li>Freeship mọi đơn hàng toàn quốc.</li>
              <li><strong>VIP Giftbox</strong> cuối năm.</li>
              <li>Vé mời tham dự các sự kiện Private / Pop-up Store của B&D.</li>
            </ul>
          </div>
        </div>
      </div>
    `,
  },
  {
    slug: 'contact',
    title: 'Liên hệ',
    content: `
      <div class="space-y-6 text-neutral-600">
        <p class="text-lg">Chúng tôi luôn ở đây để lắng nghe và hỗ trợ bạn.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div class="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h3 class="font-bold text-black text-lg mb-4">Chăm sóc khách hàng</h3>
            <p class="mb-2"><strong>Hotline:</strong> 1900 633 028 <br><span class="text-xs text-neutral-500">(9:00 - 21:00 hàng ngày)</span></p>
            <p class="mb-2"><strong>Email:</strong> customercare@bd.asia</p>
            <p class="mb-2"><strong>Fanpage:</strong> facebook.com/bd.global</p>
            <p><strong>Instagram:</strong> @bd.global</p>
          </div>
          
          <div class="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h3 class="font-bold text-black text-lg mb-4">Doanh nghiệp & Hợp tác</h3>
            <p class="mb-2"><strong>Văn phòng đại diện:</strong> 139 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM</p>
            <p class="mb-2"><strong>Email Business:</strong> business@bd.asia</p>
            <p class="mb-2"><strong>Điện thoại:</strong> 028 888 99 616</p>
          </div>
        </div>
        
        <div class="mt-8">
          <p class="italic text-sm text-neutral-500">Mọi phản hồi của bạn về sản phẩm và dịch vụ đều là động lực để B&D® phát triển hơn mỗi ngày. Xin cảm ơn!</p>
        </div>
      </div>
    `
  }
];
