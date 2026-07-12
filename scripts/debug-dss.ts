import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function debug() {
  console.log('=== DEBUG DSS DATA ===\n');

  // 1. Check profiles with role = customer
  const { data: profiles, error: pe } = await supabase
    .from('profiles')
    .select('user_id, full_name, phone, role, membership_tier, created_at')
    .eq('role', 'customer');
  
  if (pe) { console.error('Profiles error:', pe.message); return; }
  console.log(`Profiles with role=customer: ${profiles?.length ?? 0}`);
  profiles?.forEach(p => console.log(`  - ${p.full_name} | tier=${p.membership_tier} | id=${p.user_id}`));

  // 2. Check orders per user
  console.log('\n--- Orders per customer ---');
  const { data: orders, error: oe } = await supabase
    .from('orders')
    .select('id, user_id, status, total, created_at')
    .in('status', ['paid', 'confirmed', 'shipping', 'delivered']);
  
  if (oe) { console.error('Orders error:', oe.message); return; }
  console.log(`Total revenue orders: ${orders?.length ?? 0}`);
  
  // Group by user
  const byUser = new Map<string, { count: number; total: number; lastDate: string }>();
  for (const o of orders ?? []) {
    const e = byUser.get(o.user_id) ?? { count: 0, total: 0, lastDate: '' };
    e.count++;
    e.total += o.total ?? 0;
    if (!e.lastDate || o.created_at > e.lastDate) e.lastDate = o.created_at;
    byUser.set(o.user_id, e);
  }

  for (const [uid, stat] of byUser.entries()) {
    const profile = profiles?.find(p => p.user_id === uid);
    const recencyDays = stat.lastDate ? Math.floor((Date.now() - new Date(stat.lastDate).getTime()) / 86400000) : null;
    
    // RFM scoring
    const R = recencyDays == null ? 1 : recencyDays <= 14 ? 5 : recencyDays <= 30 ? 4 : recencyDays <= 60 ? 3 : recencyDays <= 120 ? 2 : 1;
    const F = stat.count >= 8 ? 5 : stat.count >= 5 ? 4 : stat.count >= 3 ? 3 : stat.count >= 1 ? 2 : 1;
    const M = stat.total >= 10000000 ? 5 : stat.total >= 5000000 ? 4 : stat.total >= 2000000 ? 3 : stat.total > 0 ? 2 : 1;
    const score = R + F + M;
    const segment = score >= 13 ? 'VIP ✅' : (recencyDays != null && recencyDays >= 60 && stat.total > 0) ? 'AT_RISK ⚠️' : 'standard';
    
    console.log(`  ${profile?.full_name ?? uid.slice(0,8)}: orders=${stat.count} total=${(stat.total/1000000).toFixed(2)}M recency=${recencyDays}d R=${R} F=${F} M=${M} score=${score} → ${segment}`);
  }

  // 3. Check membership_tier column exists
  console.log('\n--- membership_tier values ---');
  const { data: tiers } = await supabase
    .from('profiles')
    .select('full_name, membership_tier, role')
    .limit(20);
  tiers?.forEach(t => console.log(`  ${t.full_name}: role=${t.role} tier=${t.membership_tier}`));

  console.log('\n=== END DEBUG ===');
}

debug().catch(console.error);
