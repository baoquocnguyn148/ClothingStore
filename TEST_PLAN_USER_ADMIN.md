# Test Plan User/Admin - B&D Storefront

## 1. Muc tieu

Tai lieu nay la test plan tong the cho cac chuc nang da tim thay trong codebase `levents-clone`, viet theo goc nhin BA va QA senior.

Muc tieu:

- Xac dinh dung pham vi nghiep vu cua storefront, account, checkout, payment va admin.
- Tach ro chuc nang da co hanh vi that, chuc nang partial, man hinh placeholder va API chua noi UI.
- Dua ra chien luoc test manual, API, integration, E2E, regression, security va non-functional.
- Tao backlog test case co uu tien de QA co the viet testcase chi tiet va automation tiep theo.

Nguon phan tich chinh:

- App Router pages trong `app/(store)` va `app/admin`.
- API routes trong `app/api`.
- Business services trong `lib/server`.
- Cart/wishlist/account client state trong `lib/cart`, `lib/wishlist`, `lib/auth`.
- Supabase schema, RLS va migration trong `supabase/migrations`.
- Tai lieu hien co trong `README.md`, `TECHNICAL_ARCHITECTURE.md`, `IMPLEMENTATION_ROADMAP.md`.

## 2. Ket luan pham vi sau khi doc code

He thong hien co hai che do chay can test rieng:

| Mode | Dau hieu trong code | Anh huong test |
| --- | --- | --- |
| Mock/local | `COMMERCE_PROVIDER=mock` hoac `USE_SUPABASE=false` | Product/content lay tu mock data; cart, wishlist, account luu localStorage; checkout ghi nhan mock order UI. |
| Supabase/API | `USE_SUPABASE=true` | Auth, profile, address, cart, wishlist, order, payment, admin, review, inventory, promotion, shipping dung database/API. |

Khong nen viet testcase nhu the moi chuc nang deu da hoan chinh. Code cho thay:

| Trang thai | Chuc nang |
| --- | --- |
| Implemented | Catalog browsing, search/product grid filters, product detail/variant selection, cart, wishlist fallback, login/register, account profile/address/order views, admin guard, admin dashboard, product basic CRUD API/UI, order detail/status update, inventory low-stock/restock, review moderation API/UI, payment provider flow skeleton/webhooks. |
| Partial | Promotions co schema/service/API/list page nhung form tao UI chua submit; shipping co calculate API/list settings page nhung admin CRUD UI chua noi; public product review submission/display chua day du; product admin chua quan ly images/variants/tags/collections tu form. |
| Placeholder | Admin blog, customers, notification settings; admin settings tong quan; edit promotion route duoc link toi nhung khong thay page trong repo. |

## 3. Actor va muc tieu nghiep vu

| Actor | Muc tieu |
| --- | --- |
| Guest | Xem san pham/content, tim kiem, loc, them gio hang, luu wishlist local khi chua login, xem tuyen dung va ung tuyen. |
| Customer | Dang ky/dang nhap, quan ly profile/dia chi, wishlist DB, checkout, thanh toan, xem don hang cua minh. |
| Admin | Vao admin khi co `profiles.role=admin`, theo doi dashboard, san pham, ton kho, don hang, review, promotion/shipping o muc da implement. |
| Payment gateway | Goi webhook VNPay/MoMo va redirect return/success. |
| Unauthorized user | Bi chan khoi account/API/admin theo dung role/ownership. |

Business journeys can bao phu P0:

1. Guest xem san pham -> chon variant -> them cart -> dang nhap -> cart merge -> dat don -> tao payment -> payment success -> stock/cart/order cap nhat.
2. Customer dang ky/dang nhap -> cap nhat profile/dia chi -> xem order history va order detail chi cua minh.
3. Admin dang nhap -> xem dashboard -> tao/sua/publish product -> dieu chinh ton kho -> xu ly order status -> duyet review.

## 4. In scope va out of scope

### In scope

- Storefront public pages, navigation, SEO metadata co trong route, empty/error/not-found states.
- Catalog API va commerce provider behavior lien quan search/filter/sort/product/collection.
- Cart/wishlist guest va logged-in behavior.
- Auth, forgot password callback path, account guard, profile, addresses, order history/detail.
- Checkout, order creation, shipping fee, promotion validation, payment creation, gateway return/webhook, stock reservation, cart cleanup.
- Admin page guard va admin APIs.
- Admin dashboard, product list/create/edit/delete API, inventory alerts/restock/config API, orders list/detail/status/manual order API, review moderation, promotion APIs/list, shipping settings/calculate.
- Authorization, ownership, validation, API error contracts, RLS-sensitive behavior, duplicate/idempotency paths.

### Out of scope hien tai

- Tinh dung sai voi tai lieu roadmap nhung chua co code.
- Real settlement cua VNPay/MoMo/ZaloPay ben ngoai sandbox neu khong co credential va gateway test environment.
- Full CRUD blog/customers/media asset neu repo chua cung cap UI/API admin tuong ung.
- Shopify-specific checkout neu chua bat credential va chua co cart integration day du.

## 5. Gia dinh, rui ro va cau hoi BA can chot

### Gia dinh tam thoi

- VND la currency chinh.
- Product availability dua vao variant active/stock trong Supabase, va `available` trong commerce DTO o UI.
- Checkout Supabase chi cho user authenticated vi `/api/v1/orders` dung `requireAuth`.
- Admin la role trong `profiles.role`, khong dua vao email.

### Rui ro phat hien tu code

| ID | Rui ro/gap | Tac dong test |
| --- | --- | --- |
| GAP-01 | Mock va Supabase co behavior khac nhau ro rang. | Test report phai ghi mode; bug chi xay ra o mot mode khong duoc bo qua. |
| GAP-02 | Promotion form `/admin/promotions/new` hien la UI tinh, nut save chua submit API. | Test UI chi kiem tra placeholder/gap; tao promotion qua API neu can validate service. |
| GAP-03 | Link edit promotion tro den `/admin/promotions/{id}` nhung khong thay page. | Test navigation phai bat 404/gap. |
| GAP-04 | Admin blog/customers/notification settings la placeholder. | Khong viet CRUD expectation chua co. |
| GAP-05 | Public review section o homepage la static; khong thay flow user viet review tren product detail. | Review test hien tai tap trung admin moderation/API/schema. |
| GAP-06 | Product admin form chi cap nhat thong tin co ban, chua CRUD image/variant/tag/collection. | Catalog va inventory co the can seed/API/DB de tao variant cho test. |
| GAP-07 | Promotion validation route chua thuc su lay user auth tu token. | Test uses-per-user va guest/user phai danh dau rui ro. |
| GAP-08 | Cart API add item check stock, update quantity khong thay check stock. | Can test oversell qua update cart va luc reserve stock khi paid. |
| GAP-09 | Status update order cho phep chon nhieu trang thai truc tiep, khong thay state transition guard. | Can test nghiep vu voi PO: admin co duoc nhay status hay khong. |
| GAP-10 | Payment webhook co idempotency event; order status va reserve stock duoc cap nhat o webhook va admin paid path. | Can test duplicate webhook/double reserve/double cart cleanup. |

### Cau hoi BA can chot truoc UAT

1. Guest co duoc checkout khong, hay bat buoc dang nhap trong ban Supabase?
2. Order lifecycle chuan co cho phep admin chuyen tu `pending_payment` thang sang `delivered`, `cancelled`, `refunded` khong?
3. Wishlist cua guest sau login can merge vao DB hay chi fallback local?
4. Promotion duoc ap dung o checkout UI o dau? Hien order API nhan `promotionCode` nhung form checkout chua co input.
5. CV ung tuyen co bat buoc upload khong? UI ghi bat buoc nhung input khong co `required`.
6. Chinh sach file CV ve loai file, dung luong, virus scan va storage retention la gi?

## 6. Test environment va du lieu

### Environment matrix

| Env | Muc dich |
| --- | --- |
| Mock local | Fast UI smoke, content/catalog/cart/account fallback. |
| Supabase local/staging | Full API, auth, checkout, payment stub/sandbox, admin. |
| Payment sandbox | VNPay/MoMo signed callback, failed callback, duplicate callback. |
| Browser responsive | Desktop, mobile width, slow network, refresh/back-forward. |

### Role matrix

| Role | Du lieu can co |
| --- | --- |
| Guest | Cookie/session moi, localStorage rong va localStorage co cart/wishlist cu. |
| Customer A | Profile, address 0/1/nhieu, cart co item, wishlist, order pending/paid/shipping/delivered. |
| Customer B | Co order rieng de test cross-user access. |
| Admin | `profiles.role=admin`, co products, variants, stock alerts, reviews pending, orders, promotions. |
| Non-admin authenticated | `profiles.role=customer` de test admin forbidden. |

### Product/test data matrix

- Product published co nhieu images, nhieu variants size/color.
- Product sold out, product variant inactive, product unpublished, product soft-deleted.
- Product base price duoi 500K, 500K-1000K, tren 1000K.
- Product with new/best-seller/sale tag and collection assignment.
- Cart with duplicate variant, multi-variant same product, quantity 1, quantity > stock.
- Shipping zone matched province, fallback zone, free-above threshold.
- Promotion percentage, fixed amount, free shipping, expired, unpublished, min order not met, max usage reached.
- Review pending, approved, verified, unverified, long body/title null.
- Payment/order: pending payment, successful payment, failed payment, duplicate gateway event.

## 7. Test strategy

### Test levels

| Level | Focus |
| --- | --- |
| Static review | Route inventory, schema/RLS, client/server branch, validation schema, placeholder detection. |
| Unit | Promotion formula, shipping calculation, mapper/format, status/stock logic neu tach duoc. |
| API integration | Auth/role/ownership, validation, CRUD response, webhook idempotency, order/payment/stock side effects. |
| UI component | Product grid filters, forms, cart drawer, inventory inline restock, review moderation. |
| E2E | Critical guest/customer/admin journeys tren Supabase staging va smoke tren mock mode. |
| UAT | Business wording, status meaning, payment/order operations, admin workflow acceptance. |

### Priority rule

| Priority | Dinh nghia |
| --- | --- |
| P0 | Revenue, auth/security, payment/order/stock integrity, admin access. |
| P1 | Core shopping/account/admin operations va error recovery. |
| P2 | Content, cosmetic state, placeholder verification, nice-to-have coverage. |

### Entry criteria

- Env variables dung cho mode dang test.
- Migration da chay dung thu tu, seed data va role admin da san sang.
- Payment secret/test credential hoac signed fixture webhook co san.
- QA biet baseline placeholder/gap o muc 5.

### Exit criteria

- 100% P0 pass hoac co accepted risk ro rang.
- P1 critical regression khong con open severity high.
- API auth/role/ownership test pass cho admin va customer endpoints.
- Payment/order/stock side effects duoc verify trong DB/API sau success, fail va duplicate callback.
- Known gaps duoc ghi vao release note/UAT note.

## 8. User functional coverage

### 8.1 Public navigation, homepage, content

| ID | Pri | Scenario |
| --- | --- | --- |
| US-PUB-01 | P1 | Mo homepage, announcement/header/footer/hero/product sections render khong crash o mock va Supabase mode. |
| US-PUB-02 | P1 | Header navigation toi collections, category, search, cart, login/account dung route va active states hop ly. |
| US-PUB-03 | P2 | About, policy/CMS page theo slug render noi dung published; slug khong ton tai tra not-found. |
| US-PUB-04 | P2 | Blog list va blog post theo slug render anh/title/linked content neu data co. |
| US-PUB-05 | P2 | Redirect middleware category `levents-x-hello-kitty` sang `bd-x-hello-kitty`. |
| US-PUB-06 | P2 | Metadata/title/OG product va page khong tao loi voi item thieu image. |

### 8.2 Catalog, collection, search, product detail

| ID | Pri | Scenario |
| --- | --- | --- |
| US-CAT-01 | P0 | Public chi thay product/collection published va khong thay product soft-deleted/unpublished trong listing/API public. |
| US-CAT-02 | P1 | Collections page list san pham, tag `new` va `best-seller` loc dung. |
| US-CAT-03 | P1 | Category/collection slug hop le show san pham assigned; slug sai ra not-found. |
| US-CAT-04 | P1 | Search submit q, refresh URL query, loading/error/empty/result states. |
| US-CAT-05 | P1 | `/api/products` xu ly q, tag, collection, category, size, color, minPrice, maxPrice, sort va malformed numeric query khong crash. |
| US-CAT-05A | P1 | Public `/api/v1/products`, `/api/v1/products/{handle}` va `/api/v1/collections/{handle}` response dung cho handle hop le/sai va chi tra du lieu public. |
| US-CAT-06 | P1 | Product grid filter size/color/price combine AND behavior va reset filter. |
| US-CAT-07 | P1 | Sort relevance, best-selling, price asc, price desc dung thu tu hien thi. |
| US-CAT-08 | P0 | Product detail chon variant available dau tien, gia variant dung, size sold-out disabled. |
| US-CAT-09 | P1 | Chuyen thumbnail image, related products khong trung san pham hien tai. |
| US-CAT-10 | P0 | Nut add cart disabled cho sold-out/unavailable variant tren desktop va sticky mobile CTA. |
| US-CAT-11 | P1 | Wishlist heart tren product detail/product card toggle dung state va khong pha add cart. |
| US-CAT-12 | P2 | Long title/description/image missing khong vo layout mobile/desktop. |

### 8.3 Auth va session

| ID | Pri | Scenario |
| --- | --- | --- |
| US-AUTH-01 | P0 | Register valid customer tao account/profile theo trigger va route sang account. |
| US-AUTH-02 | P1 | Register password mismatch, min length, duplicate email, invalid email, missing required fields. |
| US-AUTH-03 | P0 | Login valid/invalid, empty fields, wrong password, refresh after login, logout. |
| US-AUTH-04 | P1 | Forgot password request va auth callback `next=/account/profile` behavior trong Supabase mode. |
| US-AUTH-05 | P0 | Account layout redirect guest toi `/login`; API `/me`, `/orders`, `/wishlist`, `/me/addresses` tra 401 neu chua auth. |
| US-AUTH-06 | P1 | Mock mode session localStorage tao/clear/cap nhat dung khi register/login/logout. |
| US-AUTH-07 | P0 | Logged-in customer khong vao admin page/API; admin guard redirect/403 dung. |

### 8.4 Cart

| ID | Pri | Scenario |
| --- | --- | --- |
| US-CART-01 | P0 | Add available variant tu product detail vao cart, cart drawer mo, item count/subtotal dung. |
| US-CART-02 | P1 | Add cung variant nhieu lan tang quantity; add variant khac tao line moi. |
| US-CART-03 | P0 | Update quantity, remove item, quantity <= 0 removal, clear cart behavior. |
| US-CART-04 | P1 | Mock cart persist localStorage qua refresh/new page. |
| US-CART-05 | P0 | Supabase guest cart duoc tao bang guest session va fetch lai duoc. |
| US-CART-06 | P0 | Guest cart merge vao user cart khi create order sau login; duplicate variant merge dung quantity. |
| US-CART-07 | P0 | Add cart voi inactive/out-of-stock/quantity > stock bi chan o API. |
| US-CART-08 | P0 | Update cart quantity > stock va race stock change truoc checkout duoc verify de bat rui ro oversell. |
| US-CART-09 | P1 | API unavailable trong Supabase mode fallback local co thong tin nhat quan hay tao lech state. |

### 8.5 Wishlist

| ID | Pri | Scenario |
| --- | --- | --- |
| US-WISH-01 | P1 | Guest wishlist toggle, persist localStorage, count cap nhat tren account/UI. |
| US-WISH-02 | P1 | Customer wishlist GET/POST toggle theo product handle/product id, duplicate toggle remove. |
| US-WISH-03 | P1 | Wishlist account page fetch product list theo handles, empty state, removed item disappears. |
| US-WISH-04 | P0 | Wishlist API bat buoc auth; customer khong tao wishlist cho user khac. |
| US-WISH-05 | P2 | Sau login tu guest wishlist co merge hay khong theo quyet dinh BA; hien tai code can ghi nhan behavior thuc te. |

### 8.6 Account profile, address, order view

| ID | Pri | Scenario |
| --- | --- | --- |
| US-ACC-01 | P1 | Dashboard hien ten, order count, wishlist count, address count, recent orders. |
| US-ACC-02 | P1 | Profile load/save full name/phone; email readonly o Supabase va editable o mock dung expectation. |
| US-ACC-03 | P1 | Address add first address default, add nhieu address, delete address, empty state. |
| US-ACC-04 | P1 | Address required fields, invalid payload API, delete missing id, delete dia chi khong thuoc user. |
| US-ACC-05 | P0 | Order list chi lay order cua current user; empty state va item summary dung. |
| US-ACC-06 | P0 | Order detail current user xem duoc shipping/items/total/note; Customer A khong xem order id cua Customer B. |
| US-ACC-07 | P1 | Order detail API 404/error/loading states va refresh route param. |

### 8.7 Checkout, shipping, promotion, payment, order side effects

| ID | Pri | Scenario |
| --- | --- | --- |
| US-CHK-01 | P0 | Empty cart vao checkout thay empty state va khong submit order. |
| US-CHK-02 | P0 | Checkout form validate name/email/phone/address/city, note path, loading duplicate-submit protection. |
| US-CHK-03 | P0 | Supabase checkout chua login bi order API 401; UI error khong mat cart. |
| US-CHK-04 | P0 | Order create from cart tao order/order items/status log/subtotal/shipping/total dung. |
| US-CHK-05 | P1 | Shipping calculate matched zone, fallback zone, free-above threshold, invalid province/subtotal. |
| US-CHK-06 | P1 | Promotion validate valid percentage/fixed/free shipping va invalid/expired/unpublished/min threshold/usage limit. |
| US-CHK-07 | P1 | Order API nhan `promotionCode` va total/discount/shipping fee dung; ghi ro checkout UI hien chua co field code. |
| US-CHK-08 | P0 | Payment create chi cho owner va order `pending_payment`; provider invalid/khong config tra error. |
| US-CHK-09 | P0 | ZaloPay demo success complete endpoint cap nhat paid flow dung theo implementation. |
| US-CHK-10 | P0 | VNPay/MoMo return success/fail/pending page status va cart refresh behavior. |
| US-CHK-11 | P0 | Webhook invalid signature bi reject; success webhook cap nhat payment/order/status log/stock/cart. |
| US-CHK-12 | P0 | Failed webhook cap nhat payment failed, khong reserve stock, cart con hop ly. |
| US-CHK-13 | P0 | Duplicate gateway event id khong double process, khong double subtract stock. |
| US-CHK-14 | P0 | Payment success voi stock vua het bat error/side effect theo policy, khong de order/stock lech ma khong canh bao. |
| US-CHK-15 | P1 | Mock checkout tao confirmation UI, clear cart, link account orders behavior duoc ghi nhan. |

## 9. Admin functional coverage

### 9.1 Admin auth, navigation, dashboard

| ID | Pri | Scenario |
| --- | --- | --- |
| AD-AUTH-01 | P0 | Guest mo `/admin` redirect login voi redirect param. |
| AD-AUTH-02 | P0 | Customer role mo admin redirect store va admin API 403. |
| AD-AUTH-03 | P0 | Admin role load layout/sidebar/topbar va navigation links. |
| AD-DASH-01 | P1 | Dashboard stats revenue/order/customer/inventory dung voi DB fixture. |
| AD-DASH-02 | P1 | Revenue chart 14 ngay, no-data state, recent notifications unread/read visual. |
| AD-DASH-03 | P1 | Dashboard API, notification list API va mark-notification-read API bat buoc admin; missing/invalid notification id xu ly dung. |
| AD-DASH-04 | P2 | Mock mode admin dashboard show notice va empty data khong crash. |

### 9.2 Product management

| ID | Pri | Scenario |
| --- | --- | --- |
| AD-PROD-01 | P1 | Product list show image/title/handle/category/base price/stock/published and pagination. |
| AD-PROD-02 | P1 | Product list/page/API search/category/published/limit/offset filters. |
| AD-PROD-03 | P0 | Create product valid handle/title/base price/category/published via admin form/API. |
| AD-PROD-04 | P1 | Create invalid handle, negative price, duplicate handle, missing title, unauthorized request. |
| AD-PROD-05 | P0 | Edit product basic fields, publish/unpublish, compare-at null/value. |
| AD-PROD-06 | P1 | Product detail admin API returns images/variants/tags/collections/inventory; invalid/deleted id 404. |
| AD-PROD-07 | P1 | Delete API soft-deletes and unpublishes; product disappears public/admin active list. |
| AD-PROD-08 | P1 | Link preview public product and edit route navigation. |
| AD-PROD-09 | P2 | Gap verification: form khong quan ly images/variants/tags/collections, nen inventory fixture can tao ngoai form. |

### 9.3 Inventory and stock alerts

| ID | Pri | Scenario |
| --- | --- | --- |
| AD-INV-01 | P0 | Low-stock va sold-out variants phan nhom theo threshold global/per-variant. |
| AD-INV-02 | P0 | Inline restock qty absolute value updates stock and UI state. |
| AD-INV-03 | P1 | Qty 0, positive qty, negative qty, non-number, invalid variant id, API role guard. |
| AD-INV-04 | P1 | Inventory movement/reason duoc ghi theo service behavior khi stock change. |
| AD-INV-05 | P1 | Stock alert config GET/PATCH global threshold and variant threshold; boundary 0/10000. |
| AD-INV-06 | P2 | Refresh/notification settings link and mock mode notice behavior. |

### 9.4 Order operations

| ID | Pri | Scenario |
| --- | --- | --- |
| AD-ORD-01 | P0 | Order list sorted newest, status/total/customer/phone display, empty state, pagination. |
| AD-ORD-02 | P1 | Order API filter by status/search/limit/offset; invalid query and unauthorized. |
| AD-ORD-03 | P0 | Order detail show customer, shipping, items, totals, promotion code, note, status logs. |
| AD-ORD-04 | P0 | Update status via form/API creates status log. |
| AD-ORD-05 | P0 | Set paid reserves stock exactly once theo business rule; insufficient stock/error path. |
| AD-ORD-06 | P1 | Status enum validation and status transition policy gap verification. |
| AD-ORD-07 | P1 | Manual order API only admin, valid user/cart/shipping input, cart empty and wrong UUID errors. |

### 9.5 Review moderation

| ID | Pri | Scenario |
| --- | --- | --- |
| AD-REV-01 | P1 | Review table loads all/pending/approved filters, loading/empty/error states. |
| AD-REV-02 | P1 | Approve/unpublish review updates `published` and public visibility according RLS/public query. |
| AD-REV-03 | P1 | Verified badge, null title/body, long body, missing product/user data render safely. |
| AD-REV-04 | P0 | Review moderation API admin-only and validates review UUID/published boolean. |
| AD-REV-05 | P2 | Public customer review create/display gap duoc ghi nhan neu release scope yeu cau review end-to-end. |

### 9.6 Promotions and shipping

| ID | Pri | Scenario |
| --- | --- | --- |
| AD-PROMO-01 | P1 | Promotion list show name/code/type/value/usage/published and empty state. |
| AD-PROMO-02 | P1 | Promotion API create percentage/fixed/free/custom valid schema and admin guard. |
| AD-PROMO-03 | P1 | Promotion service/API validation for date window, min order, max usage, per user, free shipping. |
| AD-PROMO-04 | P2 | New promotion page save button hien chua noi POST; edit link route missing duoc report as known gap. |
| AD-SHIP-01 | P1 | Shipping settings list zone name/provinces/fee/free threshold/published. |
| AD-SHIP-02 | P1 | Public shipping calculate API zone matching/fallback/free threshold/validation. |
| AD-SHIP-03 | P2 | Admin add/edit shipping buttons neu chua noi logic thi ghi placeholder/gap. |

### 9.7 Placeholder admin modules

| ID | Pri | Scenario |
| --- | --- | --- |
| AD-PLH-01 | P2 | Admin blog page states future support, quay lai admin works. |
| AD-PLH-02 | P2 | Admin customers page states future support. |
| AD-PLH-03 | P2 | Admin settings/notifications placeholder navigation khong gay 404 ngoai route edit promotion da neu gap. |

## 10. API, security va data integrity checklist

### Authorization/ownership

- Public endpoints chi tra published data theo contract.
- `requireAuth` endpoints tra 401 cho guest.
- `requireAdmin` endpoints tra 401 cho guest, 403 cho customer.
- User A khong doc order/address/wishlist cua User B qua ID tam doan.
- Admin service-role access khong lam lo route khong guard.
- RLS policy behavior duoc verify bang Supabase anon/authenticated client neu co the.

### Validation/negative

- JSON body rong, malformed JSON, sai field type, field thieu, UUID sai, query boundary.
- Price/qty/threshold khong am.
- Payment provider unsupported, missing secret, signature invalid.
- Duplicate product handle, duplicate webhook event, duplicate cart lines, duplicate promotion usage.

### Integrity assertions

- Cart subtotal = sum unit price x quantity.
- Order subtotal, discount, shipping fee, total khop formula va khong am.
- Order item snapshot giu title/variant/price tai thoi diem checkout.
- Payment success thay doi payment/order/status log/cart/stock theo mot transaction expectation ro rang.
- Soft-deleted/unpublished product khong public.
- Restock va order paid khong tao stock am.

## 11. Non-functional coverage

| Area | Test |
| --- | --- |
| Responsive | Product detail CTA mobile, cart drawer, checkout, account tables/cards, admin tables/inline edit tren desktop/tablet/mobile. |
| Accessibility | Keyboard navigation, focus visible, form labels/errors, disabled state, dialog/drawer focus, image alt, table semantics. |
| Performance | Product list/search query latency, admin dashboard chart/stats, large orders/products pagination, image loading. |
| Reliability | Refresh during cart/checkout/payment return, network fail/retry, back button after redirect payment. |
| Security | Role bypass, IDOR, webhook signature, XSS in product/review/CMS text, CSRF/session cookie assumptions, storage upload abuse. |
| Localization | Vietnamese text encoding/rendering, VND formatting, date format `vi-VN`, timezone/payment date interpretation. |
| Compatibility | Chromium baseline, mobile Safari/Chrome smoke neu target market mobile. |

## 12. Smoke va regression suite de chay moi build

### Smoke P0

1. Public load homepage, collection, product detail.
2. Add available variant to cart and update quantity.
3. Register/login customer.
4. Create Supabase order from cart and create ZaloPay demo payment or sandbox fixture.
5. Payment success updates order visible in account.
6. Guest/customer cannot access admin; admin can access admin.
7. Admin edit product basic field.
8. Admin restock low-stock variant.
9. Admin update order status.
10. Admin approve pending review.

### Regression P1

- Search/filter/sort combinations.
- Wishlist guest/auth.
- Profile/address CRUD.
- Order detail ownership.
- Shipping/promotion calculation.
- VNPay/MoMo failed/duplicate webhook fixtures.
- Admin product create invalid/duplicate/delete.
- Admin dashboard no-data/data.
- Placeholder routes still communicate non-implemented scope clearly.

## 13. Automation recommendation

Repo hien tai khong thay test framework trong `package.json`, nen de xuat lap automation theo thu tu:

| Phase | Automation |
| --- | --- |
| A | Them Vitest cho pure service/formula/mapper/shipping/promotion. |
| B | API integration tests voi seeded Supabase test DB va fixture auth roles. |
| C | Playwright E2E cho P0 customer/admin journeys. |
| D | Payment webhook contract fixtures signed success/fail/duplicate. |
| E | CI split mock smoke va Supabase integration/nightly regression. |

Automation case nen viet truoc:

- `checkout-payment-success-stock-cart-order.spec`
- `admin-role-guard.spec`
- `order-ownership.spec`
- `admin-product-basic-crud.spec`
- `inventory-restock-and-low-stock.spec`
- `review-moderation.spec`
- `promotion-shipping-calculation.test`

## 14. Suggested defect severity

| Severity | Vi du |
| --- | --- |
| Blocker | Khong login/admin guard sai, checkout/payment tao order sai nghiem trong, stock am tren happy path. |
| Critical | User xem order user khac, webhook invalid signature duoc chap nhan, duplicate payment tru stock hai lan. |
| High | Cart/total/payment fail mat gio hang, admin khong cap nhat order/stock, product public visibility sai. |
| Medium | Filter/sort/address UI sai nhung co workaround, placeholder link khong ro rang. |
| Low | Copy, spacing, visual consistency, metadata minor. |

## 15. Deliverables QA tiep theo

- Test case detail theo ID trong muc 8 va 9 voi steps, expected result, test data.
- API collection/contract checklist cho public, customer, admin, webhook endpoints.
- Seed script/test data reset strategy cho customer/admin/payment fixtures.
- Automation skeleton va CI gate cho smoke P0.
- Release test report tach theo Mock mode va Supabase mode.
