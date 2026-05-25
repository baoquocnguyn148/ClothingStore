import { createAdminClient } from '@/lib/supabase/admin';

export interface ShippingZone {
  id: string;
  name: string;
  provinces: string[];
  fee: number;
  freeAbove: number | null;
}

export class ShippingService {
  private db = createAdminClient();

  /**
   * Calculate shipping fee based on the destination province and cart subtotal.
   */
  async calculateFee(province: string, subtotal: number): Promise<{ fee: number; zoneName: string }> {
    // Exact match for province
    const { data: exactZone } = await this.db
      .from('shipping_zones')
      .select('*')
      .eq('published', true)
      .contains('provinces', [province])
      .limit(1)
      .single();

    if (exactZone) {
      if (exactZone.free_above && subtotal >= exactZone.free_above) {
        return { fee: 0, zoneName: exactZone.name };
      }
      return { fee: exactZone.fee, zoneName: exactZone.name };
    }

    // Fallback to default zone (empty provinces array or 'Toàn quốc')
    const { data: defaultZone } = await this.db
      .from('shipping_zones')
      .select('*')
      .eq('published', true)
      .filter('provinces', 'eq', '{}')
      .limit(1)
      .single();

    if (defaultZone) {
      if (defaultZone.free_above && subtotal >= defaultZone.free_above) {
        return { fee: 0, zoneName: defaultZone.name };
      }
      return { fee: defaultZone.fee, zoneName: defaultZone.name };
    }

    // Hard fallback if no zones configured at all
    return { fee: 35000, zoneName: 'Default' };
  }

  /**
   * Get all shipping zones (Admin)
   */
  async getZones(): Promise<ShippingZone[]> {
    const { data, error } = await this.db
      .from('shipping_zones')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data ?? []).map(z => ({
      id: z.id,
      name: z.name,
      provinces: z.provinces,
      fee: z.fee,
      freeAbove: z.free_above,
    }));
  }

  /**
   * Create or update shipping zone
   */
  async saveZone(input: { id?: string; name: string; provinces: string[]; fee: number; freeAbove?: number | null; published?: boolean }) {
    if (input.id) {
      const { data, error } = await this.db
        .from('shipping_zones')
        .update({
          name: input.name,
          provinces: input.provinces,
          fee: input.fee,
          free_above: input.freeAbove ?? null,
          published: input.published ?? true
        })
        .eq('id', input.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.db
        .from('shipping_zones')
        .insert({
          name: input.name,
          provinces: input.provinces,
          fee: input.fee,
          free_above: input.freeAbove ?? null,
          published: input.published ?? true
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  /**
   * Delete a shipping zone
   */
  async deleteZone(id: string) {
    const { error } = await this.db.from('shipping_zones').delete().eq('id', id);
    if (error) throw error;
  }
}
