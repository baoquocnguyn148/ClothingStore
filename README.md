# B&D Fashion - Enterprise E-Commerce Platform

B&D Fashion là một nền tảng thương mại điện tử toàn diện, được thiết kế và xây dựng với kiến trúc hiện đại, tập trung vào hiệu suất, trải nghiệm người dùng (UI/UX) cao cấp và hệ thống quản trị (Admin/ERP) mạnh mẽ đằng sau.

Dự án này không chỉ là một trang web bán hàng (Storefront) mà còn bao gồm một hệ thống thông tin quản lý doanh nghiệp tích hợp, bao gồm các phân hệ TPS, MIS, DSS, ESS và CRM.

---

## 🛠 Technology Stack (Công nghệ sử dụng)

Hệ thống được phát triển dựa trên các công nghệ web hiện đại nhất hiện nay:

### Frontend (Client-side)
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) - Server-side Rendering (SSR) & Static Site Generation (SSG) tối ưu SEO và tốc độ.
- **Library:** [React 19](https://react.dev/) - Thư viện UI cốt lõi.
- **Language:** TypeScript - Đảm bảo type-safety và dễ bảo trì.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework cho UI tùy biến cao, kết hợp CSS thuần (`globals.css`) cho các hiệu ứng micro-animations.
- **Icons:** Lucide React.
- **Fonts:** Google Fonts (Inter, Geist).

### Backend (Server-side)
- **API Architecture:** Next.js Route Handlers (`app/api/*`) & Server Actions.
- **BaaS (Backend-as-a-Service):** [Supabase](https://supabase.com/) - Thay thế backend truyền thống.
- **Authentication:** Supabase Auth (Hỗ trợ JWT, Email/Password login, Session management).
- **Storage:** Supabase Storage (Lưu trữ hình ảnh sản phẩm, avatar, banner).

### Database
- **RDBMS:** PostgreSQL (Được host và quản lý bởi Supabase).
- **ORM / Query Builder:** Supabase JavaScript Client (`@supabase/supabase-js`).
- **Thiết kế CSDL:** Hệ cơ sở dữ liệu quan hệ hoàn chỉnh với các bảng: `users`, `products`, `product_variants`, `orders`, `order_items`, `inventory_movements`, `wishlists`, v.v.

### Khác
- **State Management:** React Context API (`CartProvider`, `WishlistProvider`).
- **Deployment:** Vercel (Tối ưu riêng cho Next.js).

---

## 🏗 System Architecture & Design (Kiến trúc hệ thống)

Dự án sử dụng kiến trúc **Monolithic SSR (Single-repo)** thông qua Next.js App Router, chia làm 2 hệ thống chính chạy song song trên cùng một miền:

1. **Storefront (`app/(store)`):** Giao diện hướng khách hàng (B2C), tập trung vào tốc độ tải trang (Caching/SSR), SEO và trải nghiệm mua sắm mượt mà.
2. **Admin Dashboard (`app/admin` & `app/(admin)`):** Cổng quản trị nội bộ dành cho nhân viên và ban giám đốc, yêu cầu xác thực bảo mật khắt khe, fetch dữ liệu realtime hoặc dynamic.

**Luồng dữ liệu (Data Flow):**
Client (Browser) -> Next.js Server (BFF - Backend for Frontend) -> Supabase PostgreSQL.
Hệ thống cũng có một **Mock Mode** (Fallback) cho phép giao diện chạy trơn tru với dữ liệu giả lập (`getSession()`) khi chưa kết nối database thật.

---

## 🛍 Storefront Features (Chức năng người dùng - B2C)

Giao diện User được thiết kế theo phong cách tối giản (Minimalist), cao cấp (Premium) tương tự các local brand / global brand thời trang lớn.

- **Home Page:** Cấu trúc module động (Hero banner, New Arrivals, Styling/Blog, Reviews).
- **Product Discovery:** 
  - Trang Collections với bộ lọc Sidebar trực quan (Lọc theo danh mục, hàng mới, bán chạy).
  - Search engine hỗ trợ tìm kiếm sản phẩm.
- **Product Detail (PDP):**
  - Layout hình ảnh thư viện (Gallery) tối ưu hiển thị sản phẩm thời trang.
  - Chọn Màu/Size với kiểm tra tồn kho realtime.
  - Nút thêm vào giỏ hàng và mua ngay (Quick buy).
- **Cart & Checkout:**
  - Giỏ hàng dạng Drawer (Trượt từ phải sang) tích hợp thanh tiến trình Freeship (Gamification).
  - Thanh toán một trang (One-page checkout).
- **Account & Membership:**
  - Split-layout cho đăng ký/đăng nhập sang trọng.
  - Dashboard tài khoản người dùng quản lý Đơn hàng, Yêu thích (Wishlist), Địa chỉ.
  - Phân hạng thành viên (Membership Tier) - tích điểm.

---

## 🏢 Admin Panel & Information Systems (Hệ thống quản trị doanh nghiệp)

Hệ thống Admin không chỉ là quản trị website (CMS), mà được thiết kế như một phần mềm ERP thu nhỏ, ứng dụng các mô hình Hệ thống thông tin chuẩn mực:

### 1. TPS (Transaction Processing System) - Hệ thống xử lý giao dịch
- **Quản lý Đơn hàng (Orders):** Xử lý vòng đời đơn hàng từ lúc tạo mới, thanh toán, xác nhận, giao hàng đến hoàn tất hoặc hủy.
- **Quản lý Cửa hàng/Sản phẩm (Products & Catalog):** Thêm, sửa, xóa sản phẩm, tạo các biến thể (Variants - màu sắc, kích cỡ).
- **Quản lý Khuyến mãi (Promotions):** Tạo mã giảm giá, voucher.

### 2. MIS (Management Information System) - Hệ thống thông tin quản lý
- **Quản lý Tồn kho (Inventory):** Quản lý số lượng SKU, tự động cảnh báo ngưỡng tồn kho thấp (Low stock alert), ghi nhận lịch sử biến động kho (Nhập/Xuất).
- **Báo cáo nội bộ (MIS Reports):** Bảng điều khiển (Dashboard) thống kê doanh thu, số lượng đơn hàng, sản phẩm bán chạy theo thời gian thực để hỗ trợ quản lý cấp trung (Middle Management).

### 3. DSS (Decision Support System) - Hệ thống hỗ trợ ra quyết định
- **Phân tích Dữ liệu (Analytics):** Phân tích xu hướng mua hàng, tỷ lệ chuyển đổi (Conversion rate).
- Các công cụ dự báo tồn kho (Dựa trên tốc độ bán hàng - Sell-through rate) để hỗ trợ quyết định nhập thêm hàng hay chạy khuyến mãi xả kho.

### 4. ESS (Executive Support System) - Hệ thống hỗ trợ lãnh đạo
- Dành riêng cho Ban Giám Đốc (C-Level).
- Bảng Dashboard tóm tắt dữ liệu cấp cao (High-level data): Tốc độ tăng trưởng, sức khỏe doanh nghiệp, báo cáo tài chính tổng quan. Thay vì chi tiết từng đơn hàng, ESS hiển thị biểu đồ trực quan (Charts, Graphs).

### 5. CRM (Customer Relationship Management) - Quản lý quan hệ khách hàng
- Quản lý hồ sơ khách hàng (Customer profiles).
- Lịch sử mua hàng, chi tiêu tổng (Total spent), phân hạng khách hàng (VIP, Member).
- Hệ thống gửi thông báo (Notifications) và Email Marketing (Chỉnh sửa Email templates).

---

## 🚀 Setup & Installation (Hướng dẫn cài đặt)

**Yêu cầu hệ thống:**
- Node.js >= 18.17.0
- Git

**Các bước cài đặt:**

1. **Clone repository:**
   ```bash
   git clone <repo-url>
   cd levents-clone
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   # hoặc yarn install / pnpm install
   ```

3. **Cấu hình biến môi trường (Environment Variables):**
   Tạo file `.env.local` ở thư mục gốc:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   *(Lưu ý: Nếu không có `.env`, ứng dụng sẽ tự động chạy ở chế độ **Mock Mode** - không cần Database).*

4. **Khởi chạy ứng dụng (Development):**
   ```bash
   npm run dev
   ```
   Truy cập `http://localhost:3000` cho Storefront và `http://localhost:3000/admin` cho Admin Panel.

5. **Build cho Production:**
   ```bash
   npm run build
   npm run start
   ```

---
*Báo cáo được tự động tạo bởi Antigravity AI - B&D Fashion Technical Documentation.*
