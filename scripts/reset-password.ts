import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf-8');
  env.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key]) {
      process.env[key] = value.trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword(email: string, newPassword: string) {
  // 1. Find user by email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error fetching users:', userError.message);
    return;
  }

  const user = users.users.find(u => u.email === email);
  if (!user) {
    console.error(`User with email ${email} not found.`);
    return;
  }

  console.log(`Found user ${email} with ID: ${user.id}`);

  // 2. Update user password
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (updateError) {
    console.error('Failed to reset password:', updateError.message);
  } else {
    console.log(`✅ Successfully reset password for ${email} to ${newPassword}`);
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: npx tsx scripts/reset-password.ts <user_email> <new_password>');
  process.exit(1);
}

resetPassword(args[0], args[1]);
