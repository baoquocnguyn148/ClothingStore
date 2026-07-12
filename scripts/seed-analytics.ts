import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const VND = (n: number) => n.toLocaleString('vi-VN') + '₫';

async function cleanAndSeed() {
  console.log('🧹 Step 1: Clean up MOCK orders...');
  const { error: delErr } = await supabase
    .from('orders')
    .delete()
    .like('order_number', 'MOCK-%');
  if (delErr) console.error('  ❌ Delete error:', delErr.message);
  else console.log('  ✅ Removed old MOCK- orders');

  // ---- Step 2: Find our seeded users by email ----
  console.log('\n👥 Step 2: Find seeded users...');
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) { console.error('List users error:', listErr.message); return; }

  const EMAIL_MAP = {
    'vip1@example.com':    { name: 'Nguyễn Văn VIP',   tier: 'vip',      targetSpend: 18000000, orderCount: 12 },
    'vip2@example.com':    { name: 'Trần Thị Giàu',    tier: 'vip',      targetSpend: 13500000, orderCount: 9 },
    'loyal1@example.com':  { name: 'Lê Văn Quen',      tier: 'member',   targetSpend: 4500000,  orderCount: 5 },
    'atrisk1@example.com': { name: 'Phạm Thị Xa',      tier: 'member',   targetSpend: 1800000,  orderCount: 3 },
  };

  const userMap: Record<string, string> = {};
  for (const [email, cfg] of Object.entries(EMAIL_MAP)) {
    const user = users.find(u => u.email === email);
    if (!user) { console.log(`  ❌ Not found: ${email}`); continue; }
    userMap[email] = user.id;

    // Fix profile
    await supabase.from('profiles').upsert({
      user_id: user.id,
      full_name: cfg.name,
      role: 'customer',
      membership_tier: cfg.tier,
    }, { onConflict: 'user_id' });
    console.log(`  ✅ ${cfg.name} → ${user.id.slice(0,8)}...`);
  }

  // ---- Step 3: Get product variants ----
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, price, sku, size, color_name, products(title)')
    .limit(20);
  if (!variants?.length) { console.error('\n❌ No variants - run npm run db:seed first'); return; }
  console.log(`\n📦 Found ${variants.length} product variants`);

  // ---- Step 4: Create orders per user profile ----
  console.log('\n💳 Step 3: Creating orders...');

  async function makeOrder(userId: string, daysAgo: number, status: string, forceTotal: number) {
    const v = variants![Math.floor(Math.random() * variants!.length)] as any;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const { data: order, error } = await supabase.from('orders').insert({
      order_number: `MOCK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      user_id: userId,
      status,
      subtotal: forceTotal,
      shipping_fee: 30000,
      total: forceTotal + 30000,
      shipping_address: { name: 'Test', phone: '0909', address_line: '123 Lê Văn Việt', city: 'TP.HCM' },
      created_at: date.toISOString(),
      updated_at: date.toISOString(),
    }).select('id').single();
    if (error) console.error('Order insert error:', error.message);
    if (order) {
      const product = Array.isArray(v.products) ? v.products[0] : v.products;
      await supabase.from('order_items').insert({
        order_id: order.id,
        variant_id: v.id,
        product_title: product?.title ?? 'B&D Product',
        variant_size: v.size ?? 'M',
        variant_color: v.color_name ?? 'Black',
        quantity: 1,
        unit_price: forceTotal,
      });
    }
    return order?.id;
  }

  // VIP1: 12 orders, 1.5M each, recent (last 30 days), delivered
  const vip1 = userMap['vip1@example.com'];
  if (vip1) {
    const prices = [900000,1200000,1500000,1800000,2000000,2500000,1100000,1400000,1700000,1600000,1300000,2200000];
    for (let i = 0; i < 12; i++) {
      await makeOrder(vip1, Math.floor(Math.random() * 25) + 1, 'delivered', prices[i]);
    }
    const total = prices.reduce((a,b)=>a+b,0);
    console.log(`  ✅ VIP1 (Nguyễn Văn VIP): 12 orders, tổng ${VND(total)}`);
  }

  // VIP2: 9 orders, last order 3 days ago
  const vip2 = userMap['vip2@example.com'];
  if (vip2) {
    const prices = [1100000,1400000,1700000,2200000,1000000,1600000,1300000,1900000,2100000];
    for (let i = 0; i < 9; i++) {
      await makeOrder(vip2, i < 2 ? i + 1 : Math.floor(Math.random() * 25) + 3, 'delivered', prices[i]);
    }
    const total = prices.reduce((a,b)=>a+b,0);
    console.log(`  ✅ VIP2 (Trần Thị Giàu): 9 orders, tổng ${VND(total)}`);
  }

  // Loyal: 5 orders, last 15 days ago
  const loyal = userMap['loyal1@example.com'];
  if (loyal) {
    const prices = [700000,850000,900000,750000,950000];
    for (let i = 0; i < 5; i++) {
      await makeOrder(loyal, i === 0 ? 15 : 20 + i * 2, 'delivered', prices[i]);
    }
    console.log(`  ✅ Loyal (Lê Văn Quen): 5 orders`);
  }

  // At-risk: 3 orders, 90-150 days ago
  const atrisk = userMap['atrisk1@example.com'];
  if (atrisk) {
    for (let i = 0; i < 3; i++) {
      await makeOrder(atrisk, 90 + i * 20, 'delivered', 500000 + i * 200000);
    }
    console.log(`  ✅ At-risk (Phạm Thị Xa): 3 orders (90-150 ngày trước)`);
  }

  // Extra 30 random orders — ONLY for vip1/vip2 to enrich chart data
  // Do NOT assign to loyal/atrisk users so their RFM profile stays accurate
  const chartUsers = [vip1, vip2].filter(Boolean) as string[];
  const statuses = ['delivered','delivered','delivered','shipping','paid','confirmed','cancelled'];
  for (let i = 0; i < 30; i++) {
    const uid = chartUsers[Math.floor(Math.random() * chartUsers.length)];
    const total = 400000 + Math.floor(Math.random() * 1600000);
    await makeOrder(uid, Math.floor(Math.random() * 28), statuses[Math.floor(Math.random() * statuses.length)], total);
  }
  console.log('  ✅ 30 random orders cho biểu đồ MIS (chỉ VIP users)');

  // ---- Step 5: Verify ----
  console.log('\n🔍 Step 4: Verifying RFM scores...');
  const { data: allOrders } = await supabase
    .from('orders').select('user_id, status, total, created_at')
    .in('status',['paid','confirmed','shipping','delivered']);
  
  const byUser = new Map<string, {count:number, total:number, last:string}>();
  for (const o of allOrders ?? []) {
    const e = byUser.get(o.user_id) ?? {count:0, total:0, last:''};
    e.count++; e.total += o.total ?? 0;
    if (!e.last || o.created_at > e.last) e.last = o.created_at;
    byUser.set(o.user_id, e);
  }
  
  for (const [uid, stat] of byUser.entries()) {
    const { data: prof } = await supabase.from('profiles').select('full_name').eq('user_id', uid).single();
    const name = prof?.full_name ?? uid.slice(0,8);
    const recencyDays = Math.floor((Date.now() - new Date(stat.last).getTime()) / 86400000);
    const R = recencyDays <= 14 ? 5 : recencyDays <= 30 ? 4 : recencyDays <= 60 ? 3 : recencyDays <= 120 ? 2 : 1;
    const F = stat.count >= 8 ? 5 : stat.count >= 5 ? 4 : stat.count >= 3 ? 3 : stat.count >= 1 ? 2 : 1;
    const M = stat.total >= 10000000 ? 5 : stat.total >= 5000000 ? 4 : stat.total >= 2000000 ? 3 : stat.total > 0 ? 2 : 1;
    const score = R + F + M;
    const seg = score >= 13 ? '🟡 VIP' : (recencyDays >= 60 && stat.total > 0) ? '🔴 AT_RISK' : '⚪ standard';
    console.log(`  ${seg} | ${name}: orders=${stat.count} spend=${VND(stat.total)} recency=${recencyDays}d score=${score}(R${R}F${F}M${M})`);
  }

  console.log('\n✅ Done! Refresh /admin/decision-support and /admin/reports\n');
}

cleanAndSeed().catch(console.error);
