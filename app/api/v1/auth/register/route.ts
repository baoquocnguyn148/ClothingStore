import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/api/response';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  name: z.string().min(1, 'Tên không được để trống').max(100),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return jsonError(firstError.message, 400);
    }

    const { email, password, name, phone } = parsed.data;
    const db = createAdminClient();

    // Check if email already exists
    const { data: existingUsers } = await db.auth.admin.listUsers();
    const emailExists = existingUsers.users.some(
      u => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return jsonError('Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.', 409);
    }

    // Create user via admin API (bypasses email confirmation requirement)
    const { data: authData, error: createError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ← Auto-confirm email immediately
      user_metadata: {
        full_name: name,
        phone: phone ?? null,
      },
    });

    if (createError || !authData.user) {
      console.error('[Register API] Create user error:', createError);
      return jsonError(createError?.message ?? 'Không thể tạo tài khoản. Vui lòng thử lại.', 500);
    }

    return jsonOk({
      message: 'Đăng ký thành công!',
      userId: authData.user.id,
    }, 201);

  } catch (e) {
    console.error('[Register API] Unexpected error:', e);
    return jsonError('Lỗi server. Vui lòng thử lại.', 500);
  }
}
