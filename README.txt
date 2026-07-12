================================================================================
   B&D FASHION — Enterprise E-Commerce Platform
   Vietnamese Streetwear | Full-Stack Web Application
================================================================================

  Live Demo : https://clothing-store-82ef.vercel.app/
  GitHub    : https://github.com/baoquocnguyn148/ClothingStore
  Version   : 0.1.0

--------------------------------------------------------------------------------
TABLE OF CONTENTS (MỤC LỤC LƯỚT NHANH)
--------------------------------------------------------------------------------
  1. Project Overview (Tổng quan dự án)
  2. Tech Stack (Đồ chơi công nghệ)
  3. System Architecture (Kiến trúc hệ thống)
  4. Features List (Các tính năng đã build)
  5. Requirements (Cần cài gì trước khi run)
  6. Quick Start (Run hệ Mock - Không cần Database thật)
  7. Full Setup (Run hệ Supabase - Hàng Real)
  8. Env File (Cấu hình biến môi trường)
  9. Database Setup (Chạy Migrations)
 10. Available Scripts (Mấy lệnh npm hay xài)
 11. Folder Structure (Cấu trúc source code)
 12. Admin Panel (Cách access vào trang quản trị)
 13. Deployment (Đẩy lên Vercel)
 14. Troubleshooting (Fix bugs lặt vặt)
 15. License & Credits

================================================================================
1. PROJECT OVERVIEW
================================================================================

B&D Fashion là một con hàng e-commerce platform full-featured được build dành 
riêng cho một brand streetwear Việt Nam. Nó kết hợp một cái storefront B2C xịn xò
cùng với một hệ thống Admin/ERP đồ sộ bên trong một Next.js monorepo duy nhất.

  Key Highlights:
  - Storefront UI bao mượt, flow chuẩn các global fashion brands.
  - Admin Panel tích hợp full module: TPS / MIS / DSS / ESS / CRM.
  - Dual-mode: có thể run bằng database thật (Supabase) hoặc offline Mock data.
  - Tích hợp cổng thanh toán (payment gateway) VNPay, MoMo (sandbox).
  - Có chatbot AI assistant tích hợp sẵn.
  - Tối ưu SEO chuẩn chỉ, support SSR / SSG.

================================================================================
2. TECH STACK (Đồ chơi công nghệ)
================================================================================

  FRONTEND
  --------
  - Framework   : Next.js 15 (App Router) — SSR & SSG support
  - UI Library  : React 19
  - Language    : TypeScript 5.7 (Code strict cho an tâm)
  - Styling     : Tailwind CSS v4 + micro-animations tự code
  - Icons       : Lucide React
  - Components  : Radix UI (headless), build style theo shadcn/ui
  - Charts      : Recharts để render biểu đồ cho đẹp
  - Fonts       : Google Fonts (Inter, Geist)

  BACKEND
  -------
  - API Layer   : Next.js Route Handlers + Server Actions (no need Express)
  - BaaS        : Supabase gánh Auth, Database, Storage, Realtime
  - Auth        : Supabase Auth (JWT, Email/Password session)
  - Email       : Send qua Resend API
  - Payments    : VNPay, MoMo (sandbox mode)

  DATABASE
  --------
  - Engine      : PostgreSQL (Supabase lo)
  - Client      : @supabase/supabase-js v2
  - ORM         : Chơi Raw SQL + RLS policies cho bảo mật
  - Migrations  : Mấy chục file SQL vứt trong folder /supabase/migrations/

  DEVOPS & TESTING
  ----------------
  - Hosting     : Vercel (Auto deploy cho nhàn)
  - E2E Tests   : Playwright
  - Unit Tests  : Node.js test runner (tsx --test)
  - Analytics   : Vercel Analytics tracking log

================================================================================
3. SYSTEM ARCHITECTURE
================================================================================

  Kiến trúc: Monolithic SSR (chơi single-repo, xài Next.js App Router).

  Bao gồm 2 modes để run:
  [1] MOCK MODE   — Khỏi cần setup DB, fetch data tĩnh từ /data/mock/. 
                    Dùng để UI/UX testing hoặc dev lẹ.
  [2] SUPABASE    — Dùng hàng real, data sống. Yêu cầu setup keys đàng hoàng.

================================================================================
4. FEATURES LIST (Tính năng)
================================================================================

  STOREFRONT (Dành cho User)
  ----------------------------
  [x] Home Page — Banner động, hàng mới, best sellers.
  [x] Collections — Filter sản phẩm, sidebar các kiểu.
  [x] Product Detail — Xem ảnh, chọn size/màu, check stock real-time.
  [x] Cart & Checkout — Thanh toán mượt, support VNPay/MoMo/COD.
  [x] Auth — Login, Đăng ký, Quên pass.
  [x] User Dashboard — Tracking đơn hàng, Wishlist, Địa chỉ.
  [x] Thành viên — Tích điểm, nâng rank VIP.
  [x] Extra — Blog, AI Chatbot, Reviews, Size Guide.

  ADMIN PANEL (Dành cho Staff/Sếp)
  --------------------------------
  [TPS] Orders & Products — Quản lý vòng đời đơn hàng, CRUD sản phẩm.
  [MIS] Inventory & Reports — Theo dõi stock, report doanh thu.
  [DSS] Analytics — Gợi ý insight, phân tích tỉ lệ chuyển đổi.
  [ESS] Executive — Dashboard KPI cho level C (Sếp tổng).
  [CRM] Customers — Quản lý profile, follow-up, gửi campaign.
  [CMS] Blog & Content — Chỉnh sửa bài viết, thay đổi banner trang chủ.
  [SYS] Settings — Cấu hình hệ thống, phí ship, template email.

================================================================================
5. REQUIREMENTS (Cần cài gì?)
================================================================================

  Bắt buộc:
  - Node.js >= 18.17 (Tải tại nodejs.org)
  - Git
  - npm >= 9.x

  Option thêm: Account Supabase để run hệ data thật.

================================================================================
6. QUICK START (Run hệ Mock - Không cần Database)
================================================================================

  Dành cho ai lười setup DB, chỉ muốn kéo code về run UI check xem sao.

  STEP 1 — Clone repo
  ------------------------------
    git clone https://github.com/baoquocnguyn148/ClothingStore.git
    cd ClothingStore

  STEP 2 — Cài packages (Dependencies)
  ------------------------------
    npm install

  STEP 3 — Config Env file
  ----------------------------------
    Copy file .env.example ra thành .env.local, rồi check kỹ 2 dòng này:
      COMMERCE_PROVIDER=mock
      NEXT_PUBLIC_COMMERCE_PROVIDER=mock

  STEP 4 — Start server lên
  ----------------------------------------
    npm run dev

  STEP 5 — Check trình duyệt
  -------------------------
    Store: http://localhost:3000
    Admin: http://localhost:3000/admin

================================================================================
7. FULL SETUP (Chạy hệ Supabase Real)
================================================================================

  STEP 1–2: Vẫn clone repo và run `npm install`.

  STEP 3 — Tạo project trên Supabase
  ------------------------------------
    - Lên supabase.com tạo project, đợi nó init xong.
    - Lấy 3 thông số này trong Project Settings > API:
      + Project URL
      + anon key (public)
      + service_role key (Cái này phải GIẤU KỸ, không đc share lung tung)

  STEP 4 — Đổ data vào Env file
  ------------------------------------------
    Mở file .env.local lên và sửa lại:
      COMMERCE_PROVIDER=supabase
      NEXT_PUBLIC_COMMERCE_PROVIDER=supabase
      
      NEXT_PUBLIC_SUPABASE_URL=link-cua-ban
      NEXT_PUBLIC_SUPABASE_ANON_KEY=key-anon
      SUPABASE_SERVICE_ROLE_KEY=key-service-role

  STEP 5 — Chạy Migrations (Setup Database schema)
  ----------------------------------
    Vào SQL Editor trên Supabase, lấy mấy file SQL trong thư mục 
    `/supabase/migrations/` paste vào run lần lượt từ cũ đến mới.

  STEP 6 — Seed Data (Bơm data ảo cho dễ test)
  ---------------------------------------
    npm run db:seed
    Nó sẽ insert sẵn mấy cái products, categories để demo.

  STEP 7 — Tạo Admin User
  ------------------------------
    - Lên web (localhost:3000) tự đăng ký 1 tài khoản mới.
    - Xong mở terminal run lệnh này để set role Admin:
      npx tsx scripts/make-admin.ts email-ban-vua-dang-ky@gmail.com

  STEP 8 — Start dev server
  -----------------------------------
    npm run dev

================================================================================
8. ENV VARIABLES (Các biến môi trường)
================================================================================

  Đọc file .env.example để biết thêm chi tiết. 
  Lưu ý quan trọng: KHÔNG BAO GIỜ commit .env.local lên Github.

================================================================================
9. DATABASE SETUP
================================================================================

  Nhớ run SQL theo thứ tự từ file số 1 đến hết trong folder `migrations`.
  - 01: Core tables (user, orders, products)
  - 02: RLS Policies (phân quyền bảo mật)
  - ...
  - 15: MIS, DSS, CRM analytics

================================================================================
10. LỆNH NPM (Scripts)
================================================================================

  npm run dev       -> Mở dev server
  npm run build     -> Build bản production
  npm run start     -> Start server bản production (nhớ build trước)
  npm run lint      -> Check lỗi syntax ESLint
  npm run db:seed   -> Seed data mẫu lên Supabase

================================================================================
11. FOLDER STRUCTURE (Cấu trúc source code)
================================================================================

  levents-clone/
  ├── app/                       # Source Next.js App Router
  │   ├── (store)/               # Giao diện khách hàng (Storefront)
  │   ├── admin/                 # Admin Panel
  │   ├── api/                   # REST API backend
  │   ├── globals.css            # Styles toàn cục
  ├── components/                # React Components
  ├── lib/                       # Code core: gọi supabase, logic cart...
  ├── data/mock/                 # Chứa mock data dạng file JSON tĩnh
  ├── supabase/migrations/       # File SQL để setup DB
  └── scripts/                   # Mấy cái tool chạy tay (npx tsx)

================================================================================
12. DEPLOYMENT (Đẩy code lên Vercel)
================================================================================

  Xài Vercel là best choice cho con Next.js này.
  1. Push code lên Github (`git add .`, `git commit -m "push code"`, `git push`)
  2. Lên vercel.com tạo project, link cái repo Github vào.
  3. Bê hết đống config trong `.env.local` nhét vào mục Environment Variables.
  4. Bấm Deploy. Nhớ update `NEXT_PUBLIC_APP_URL` thành domain của Vercel nhé.

================================================================================
13. FIX BUGS LẶT VẶT (Troubleshooting)
================================================================================

  - Lỗi "Cannot find module": Chạy lại `npm install` xem sao.
  - Vào admin bị đá ra home: Chắc chưa cấp role Admin. Xem lại Step 7.
  - Hình load bị xịt: Check lại Storage bucket trên Supabase set Public chưa.
  - Vẫn hiện Mock data dù đã config: Coi lại file .env.local đổi thành `supabase` chưa. Nhớ restart lại dev server!

================================================================================
14. LICENSE & CREDITS
================================================================================

  Project này được build để nộp Báo Cáo Chuyên Đề, cover đủ 5 hệ thống HTTT:
  TPS, MIS, DSS, ESS và CRM.

  Built with Next.js, Supabase, Tailwind, Radix UI.
  Design lấy cảm hứng từ brand Levents.
  Author: baoquocnguyn148 - Sinh viên ĐH UEF.

================================================================================
  END OF README
================================================================================
