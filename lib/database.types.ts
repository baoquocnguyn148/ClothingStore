export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          handle: string;
          title: string;
          description: string;
          base_price: number;
          compare_at_price: number | null;
          category: string;
          published: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          size: string;
          color_name: string;
          color_hex: string;
          price: number;
          stock_qty: number;
          is_active: boolean;
        };
      };
      product_images: {
        Row: { id: string; product_id: string; url: string; alt: string | null; sort_order: number };
      };
      collections: {
        Row: {
          id: string;
          handle: string;
          title: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          published: boolean;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string | null;
          membership_tier: string;
          role: 'customer' | 'admin';
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: string;
          subtotal: number;
          shipping_fee: number;
          total: number;
          shipping_address: Json;
          note: string | null;
          created_at: string;
        };
      };
      carts: { Row: { id: string; user_id: string | null; guest_session_id: string | null } };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          variant_id: string;
          quantity: number;
          unit_price: number;
        };
      };
    };
  };
}
