import { createAdminClient } from '../lib/supabase/admin';

async function main() {
  const db = createAdminClient();

  // List all users
  const { data: users } = await db.auth.admin.listUsers();
  
  console.log('=== TẤT CẢ USERS ===');
  for (const u of users.users) {
    const confirmed = u.email_confirmed_at ? '✅ CONFIRMED' : '❌ NOT CONFIRMED';
    const role = u.app_metadata?.role ?? 'user';
    console.log(`  ${u.email} | ${confirmed} | role: ${role} | id: ${u.id}`);
  }
  console.log(`Tổng: ${users.users.length} users\n`);

  // Find the user from the screenshot (haiduong@gmail.com)
  const testUser = users.users.find(u => u.email === 'haiduong@gmail.com');
  if (testUser && !testUser.email_confirmed_at) {
    console.log('🔧 Đang xác nhận email cho haiduong@gmail.com...');
    const { error } = await db.auth.admin.updateUserById(testUser.id, {
      email_confirm: true,
    });
    if (error) {
      console.error('❌ Lỗi:', error.message);
    } else {
      console.log('✅ Đã xác nhận email haiduong@gmail.com!');
    }
  }

  // Confirm ALL unconfirmed users
  const unconfirmed = users.users.filter(u => !u.email_confirmed_at);
  if (unconfirmed.length > 0) {
    console.log(`\n🔧 Đang xác nhận ${unconfirmed.length} email chưa xác nhận...`);
    for (const u of unconfirmed) {
      const { error } = await db.auth.admin.updateUserById(u.id, {
        email_confirm: true,
      });
      if (error) {
        console.error(`  ❌ ${u.email}: ${error.message}`);
      } else {
        console.log(`  ✅ ${u.email} - đã xác nhận!`);
      }
    }
  }

  // Find or create admin
  console.log('\n=== KIỂM TRA ADMIN ===');
  const adminEmail = 'admin@bnstore.vn';
  const existingAdmin = users.users.find(u => u.email === adminEmail);
  
  if (existingAdmin) {
    console.log(`✅ Admin tồn tại: ${adminEmail}`);
    console.log(`   ID: ${existingAdmin.id}`);
    console.log(`   Confirmed: ${existingAdmin.email_confirmed_at ? 'YES' : 'NO'}`);
    console.log(`   Role: ${existingAdmin.app_metadata?.role}`);
  } else {
    console.log('⚠️ Không tìm thấy admin@bnstore.vn - Kiểm tra email khác...');
    const anyAdmin = users.users.find(u => u.app_metadata?.role === 'admin');
    if (anyAdmin) {
      console.log(`✅ Found admin: ${anyAdmin.email} | ID: ${anyAdmin.id}`);
    } else {
      console.log('❌ Không có user nào có role=admin');
    }
  }
}

main().catch(console.error);
