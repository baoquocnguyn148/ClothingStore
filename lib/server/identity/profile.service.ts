import { createAdminClient } from '@/lib/supabase/admin';

export class ProfileService {
  private db = createAdminClient();

  async getProfile(userId: string) {
    const { data: profile } = await this.db
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: addresses } = await this.db
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    return { profile, addresses: addresses ?? [] };
  }

  async updateProfile(userId: string, data: { full_name?: string; phone?: string }) {
    const { data: profile, error } = await this.db
      .from('profiles')
      .update(data)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return profile;
  }

  async addAddress(
    userId: string,
    addr: { name: string; phone: string; address_line: string; city: string; is_default?: boolean }
  ) {
    if (addr.is_default) {
      await this.db.from('addresses').update({ is_default: false }).eq('user_id', userId);
    }

    const { data, error } = await this.db
      .from('addresses')
      .insert({ user_id: userId, ...addr })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAddress(userId: string, addressId: string) {
    await this.db.from('addresses').delete().eq('id', addressId).eq('user_id', userId);
  }
}
