'use client';

export function Footer() {
  return (
    <footer className="w-full bg-black text-white py-16 md:py-24">
      <div className="container-mqb">
        {/* Top Section - Company Info + Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold mb-4 uppercase">Xem ngay</h3>
            <ul className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed">
              <li>
                <span className="block">
                  • Mô tả doanh nghiệp: 0316373985 đó là Nhà xuất bản Thương mại Digi-2023
                </span>
              </li>
              <li>
                <span className="block">
                  • Địa chỉ: 117/11 Tống Tự Tạo, Vinh Hoa, Cái Răng, Tây Đô Mỹ, Ninh Kiều, Cần Thơ
                </span>
              </li>
              <li>
                <span className="block">
                  • Điện thoại: 028 888 99 616
                </span>
              </li>
              <li>
                <span className="block">
                  • Email: business@levents.asia
                </span>
              </li>
            </ul>
          </div>

          {/* Links Column 1 */}
          <div>
            <select className="bg-black text-white text-sm border border-gray-600 px-3 py-2 w-full mb-4">
              <option>Liên hệ</option>
              <option>FAQ</option>
              <option>Returns</option>
            </select>
          </div>

          {/* Links Column 2 */}
          <div>
            <select className="bg-black text-white text-sm border border-gray-600 px-3 py-2 w-full mb-4">
              <option>Cửa hàng</option>
              <option>About</option>
            </select>
          </div>

          {/* Links Column 3 */}
          <div>
            <select className="bg-black text-white text-sm border border-gray-600 px-3 py-2 w-full mb-4">
              <option>Hỗ trợ</option>
              <option>Shipping</option>
              <option>Returns</option>
            </select>
          </div>

          {/* Links Column 4 */}
          <div>
            <select className="bg-black text-white text-sm border border-gray-600 px-3 py-2 w-full mb-4">
              <option>Mở rộng</option>
              <option>Partners</option>
              <option>Press</option>
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <p className="text-xs md:text-sm text-gray-400 text-center">
            © 2024 MQB. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
