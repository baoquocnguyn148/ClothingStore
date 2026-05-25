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

async function setAdminRole(email: string) {
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

  // 2. Update profile role to 'admin'
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Failed to update role in profiles table:', updateError.message);
  } else {
    console.log(`✅ Successfully granted admin role to ${email}`);
  }
}

const emailArgs = process.argv.slice(2);
if (emailArgs.length === 0) {
  console.log('Usage: npx tsx scripts/make-admin.ts <user_email>');
  process.exit(1);
}

setAdminRole(emailArgs[0]);
