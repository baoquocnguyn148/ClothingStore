import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// 5 customers with distinct RFM profiles:
// vip1, vip2 → VIP (high spend, frequent, recent)
// loyal1 → Loyal (moderate spend, regular)
// atrisk1 → At Risk (last order 90+ days ago)
// new1 → New, no orders
const MOCK_CUSTOMERS = [
  { email: 'vip1@example.com',    name: 'Nguyễn Văn VIP',   phone: '0901111111', tier: 'vip' },
  { email: 'vip2@example.com',    name: 'Trần Thị Giàu',    phone: '0902222222', tier: 'vip' },
  { email: 'loyal1@example.com',  name: 'Lê Văn Quen',      phone: '0903333333', tier: 'member' },
  { email: 'atrisk1@example.com', name: 'Phạm Thị Xa',      phone: '0904444444', tier: 'member' },
  { email: 'new1@example.com',    name: 'Hoàng Văn Mới',    phone: '0905555555', tier: 'standard' },
];

async function getOrCreateUser(customer: typeof MOCK_CUSTOMERS[0]) {
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  let user = users.find(u => u.email === customer.email);
  if (!user) {
    const { data: { user: newUser }, error } = await supabase.auth.admin.createUser({
      email: customer.email,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: customer.name, phone: customer.phone }
    });
    if (error || !newUser) { console.error(`❌ Cannot create ${customer.email}`, error); return null; }
    user = newUser;
  }

  // Ensure profile is up-to-date
  await supabase.from('profiles').upsert({
    user_id: user.id,
    full_name: customer.name,
    phone: customer.phone,
    role: 'customer',
    membership_tier: customer.tier,
  }, { onConflict: 'user_id' });

  return user.id;
}

async function createOrder(
  userId: string,
  variants: Array<{ id: string; price: number }>,
  daysAgo: number,
  status: string,
  forceTotal?: number
) {
  const v1 = variants[Math.floor(Math.random() * variants.length)];
  const v2 = variants[Math.floor(Math.random() * variants.length)];
  const useTwo = Math.random() > 0.4;
  const subtotal = forceTotal ?? (v1.price + (useTwo ? v2.price : 0));
  const shipping = 30000;
  const total = subtotal + shipping;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  const { data: order } = await supabase.from('orders').insert({
    order_number: `MOCK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    user_id: userId,
    status,
    subtotal,
    shipping_fee: shipping,
    total,
    payment_method: Math.random() > 0.5 ? 'cod' : 'vnpay',
    shipping_address: { name: 'Test', phone: '0123', address_line: '123 Lê Văn Việt', city: 'TP.HCM' },
    created_at: date.toISOString(),
    updated_at: date.toISOString(),
  }).select('id').single();

  if (order) {
    const items: any[] = [{ order_id: order.id, variant_id: v1.id, quantity: 1, unit_price: v1.price, total_price: v1.price }];
    if (useTwo && !forceTotal) items.push({ order_id: order.id, variant_id: v2.id, quantity: 1, unit_price: v2.price, total_price: v2.price });
    await supabase.from('order_items').insert(items);
  }
}

async function seedAnalytics() {
  console.log('🚀 Starting Analytics & CRM seed (v2)...\n');

  // -- STEP 1: Get / create users --
  const userMap: Record<string, string> = {};
  for (const c of MOCK_CUSTOMERS) {
    const id = await getOrCreateUser(c);
    if (id) { userMap[c.email] = id; console.log(`  ✅ ${c.name} (${c.email})`); }
  }
  const [vip1, vip2, loyal, atrisk] = [
    userMap['vip1@example.com'],
    userMap['vip2@example.com'],
    userMap['loyal1@example.com'],
    userMap['atrisk1@example.com'],
  ];
  const allUsers = Object.values(userMap).filter(Boolean);
  console.log('');

  // -- STEP 2: Get product variants --
  const { data: variants } = await supabase.from('product_variants').select('id, price').limit(20);
  if (!variants || variants.length === 0) {
    console.error('❌ No product variants. Run npm run db:seed first.'); return;
  }
  console.log(`  Found ${variants.length} product variants\n`);

  // -- STEP 3: Create rich, realistic orders --
  console.log('📦 Creating orders...');

  // VIP 1: 12 orders spread over 30 days, each 900k-2.5M → total ~15M
  if (vip1) {
    const vipPrices = [900000, 1200000, 1500000, 1800000, 2000000, 2500000];
    for (let i = 0; i < 12; i++) {
      await createOrder(vip1, variants, Math.floor(Math.random() * 28) + 1, 'delivered', vipPrices[i % vipPrices.length]);
    }
    console.log('  ✅ VIP1: 12 orders (avg 1.5M each)');
  }

  // VIP 2: 9 orders, last order 5 days ago → total ~12M
  if (vip2) {
    const vipPrices2 = [1100000, 1400000, 1700000, 2200000, 1000000, 1600000, 1300000, 1900000, 2100000];
    for (let i = 0; i < 9; i++) {
      await createOrder(vip2, variants, i < 2 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 25) + 5, 'delivered', vipPrices2[i]);
    }
    console.log('  ✅ VIP2: 9 orders (avg 1.5M each)');
  }

  // Loyal: 5 orders, last 15 days ago → total ~4M
  if (loyal) {
    const loyalPrices = [700000, 850000, 900000, 750000, 950000];
    for (let i = 0; i < 5; i++) {
      await createOrder(loyal, variants, i < 1 ? 15 : Math.floor(Math.random() * 25) + 10, 'delivered', loyalPrices[i]);
    }
    console.log('  ✅ Loyal: 5 orders (avg 830K each)');
  }

  // At Risk: 3 orders but VERY old (90-150 days ago)
  if (atrisk) {
    for (let i = 0; i < 3; i++) {
      await createOrder(atrisk, variants, 90 + Math.floor(Math.random() * 60), 'delivered', 600000 + Math.floor(Math.random() * 400000));
    }
    console.log('  ✅ AtRisk: 3 old orders (90-150 days ago)');
  }

  // Extra random orders from all users to make MIS charts richer
  const orderStatuses = ['delivered', 'delivered', 'delivered', 'shipping', 'paid', 'confirmed', 'cancelled'];
  for (let i = 0; i < 40; i++) {
    const uid = allUsers[Math.floor(Math.random() * allUsers.length)];
    if (uid) await createOrder(uid, variants, Math.floor(Math.random() * 30), orderStatuses[Math.floor(Math.random() * orderStatuses.length)]);
  }
  console.log('  ✅ 40 extra random orders for charts\n');

  // -- STEP 4: CRM Tasks --
  console.log('📋 Creating CRM Tasks & Tickets...');
  const taskTitles = [
    'Gọi điện chăm sóc sau mua', 'Follow-up đơn hàng VIP', 'Hỏi thăm trải nghiệm sản phẩm',
    'Nhắc gia hạn membership', 'Gửi voucher tặng sinh nhật', 'Tư vấn outfit mùa hè',
    'Xác nhận địa chỉ giao hàng', 'Mời tham gia sale event'
  ];
  const taskPriorities = ['low', 'normal', 'high', 'urgent'] as const;

  for (let i = 0; i < taskTitles.length; i++) {
    const uid = allUsers[i % allUsers.length];
    const dueOffset = [-3, -1, 1, 2, 3, 5, 7, 14][i]; // some overdue (negative)
    const due = new Date();
    due.setDate(due.getDate() + dueOffset);
    await supabase.from('crm_tasks').insert({
      customer_user_id: uid,
      title: taskTitles[i],
      body: 'Chăm sóc khách hàng thường xuyên để tăng tỉ lệ quay lại.',
      status: dueOffset < 0 ? 'open' : (Math.random() > 0.4 ? 'open' : 'done'),
      priority: taskPriorities[Math.floor(Math.random() * taskPriorities.length)],
      due_at: due.toISOString(),
    });
  }
  console.log('  ✅ 8 CRM Tasks (3 overdue)');

  // -- STEP 5: CRM Tickets --
  const ticketData = [
    { subject: 'Đơn hàng giao chậm hơn dự kiến', priority: 'high', status: 'open' },
    { subject: 'Sản phẩm bị lỗi vải tại đường may', priority: 'urgent', status: 'open' },
    { subject: 'Hỏi cách đổi size sản phẩm', priority: 'normal', status: 'pending' },
    { subject: 'Thanh toán thất bại, tiền bị trừ', priority: 'urgent', status: 'open' },
    { subject: 'Muốn hủy đơn và hoàn tiền', priority: 'high', status: 'pending' },
    { subject: 'Không nhận được email xác nhận', priority: 'normal', status: 'resolved' },
    { subject: 'Voucher không áp dụng được', priority: 'low', status: 'closed' },
    { subject: 'Hỏi về chương trình thành viên VIP', priority: 'low', status: 'resolved' },
  ];

  for (let i = 0; i < ticketData.length; i++) {
    const uid = allUsers[i % allUsers.length];
    const t = ticketData[i];
    await supabase.from('crm_tickets').insert({
      customer_user_id: uid,
      subject: t.subject,
      body: 'Chi tiết vấn đề khách hàng phản ánh.',
      status: t.status,
      priority: t.priority,
    });
  }
  console.log('  ✅ 8 CRM Tickets (4 urgent/high)\n');

  // -- STEP 6: CRM Campaigns --
  console.log('📢 Creating CRM Campaigns...');
  const { data: segments } = await supabase.from('crm_segments').select('id, name');
  if (segments && segments.length > 0) {
    const seg = (name: string) => segments.find(s => s.name?.toLowerCase().includes(name))?.id ?? segments[0].id;

    await supabase.from('crm_campaigns').insert([
      {
        name: 'Summer Collection Launch 2026',
        objective: 'Drive revenue cho BST Hè mới',
        segment_id: seg('vip'),
        channel: 'email',
        status: 'running',
        budget: 8000000,
        expected_revenue: 80000000,
        notes: 'Gửi email cá nhân hóa cho 200 khách VIP',
      },
      {
        name: 'Win-back 90-day',
        objective: 'Lấy lại khách không mua 90 ngày',
        segment_id: seg('win'),
        channel: 'sms',
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 86400000 * 5).toISOString(),
        budget: 3000000,
        expected_revenue: 25000000,
        notes: 'Voucher 20% cho khách cũ quay lại',
      },
      {
        name: 'Welcome Series - New Members',
        objective: 'Chào đón thành viên mới',
        segment_id: seg('new'),
        channel: 'email',
        status: 'running',
        budget: 1000000,
        expected_revenue: 15000000,
        notes: 'Chuỗi 3 email chào mừng trong 7 ngày đầu',
      },
    ]);
    console.log('  ✅ 3 CRM Campaigns\n');
  }

  console.log('✅ Analytics & CRM Seed v2 DONE!\n');
  console.log('Now reload /admin/decision-support and /admin/reports to see data.\n');
}

seedAnalytics().catch(console.error);
