/**
 * Run: npx tsx scripts/seed-email-templates.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf-8');
  env.split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0 && !process.env[key]) {
      process.env[key] = rest.join('=').trim();
    }
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

const templates = [
  {
    type: 'order_confirmation',
    name: 'Xác nhận đơn hàng',
    subject: 'Đơn hàng của bạn đã được xác nhận',
    body: 'Xin chào {{customer_name}},\n\nCảm ơn bạn đã đặt hàng. Đơn hàng {{order_number}} của bạn đã được xác nhận và sẽ sớm được xử lý.',
  },
  {
    type: 'order_shipped',
    name: 'Đơn hàng đang giao',
    subject: 'Đơn hàng của bạn đã được gửi đi',
    body: 'Xin chào {{customer_name}},\n\nĐơn hàng {{order_number}} đang được vận chuyển. Mã theo dõi: {{tracking_number}}.',
  },
  {
    type: 'order_cancelled',
    name: 'Đơn hàng đã hủy',
    subject: 'Đơn hàng của bạn đã bị hủy',
    body: 'Xin chào {{customer_name}},\n\nĐơn hàng {{order_number}} đã bị hủy. Nếu cần hỗ trợ, vui lòng liên hệ bộ phận CSKH.',
  },
];

async function seed() {
  for (const template of templates) {
    const { error } = await supabase
      .from('email_templates')
      .upsert(template, { onConflict: 'type' });

    if (error) {
      if (
        error.message.includes("Could not find the table") ||
        error.message.includes('relation "public.email_templates" does not exist') ||
        error.message.includes('table \"public.email_templates\" does not exist')
      ) {
        console.error('Bảng email_templates chưa tồn tại trong Supabase.');
        console.error('Bạn cần chạy migration trong `supabase/migrations/20260524000001_email_templates.sql` trước khi seed.');
      } else {
        console.error('Failed to seed template', template.type, error.message);
      }
      process.exit(1);
    }

    console.log(`Seeded email template: ${template.type}`);
  }

  console.log('Email template seed completed.');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
