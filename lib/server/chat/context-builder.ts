import { createServerSupabaseClient } from '@/lib/supabase/server';
import { detectIntent, extractSearchKeywords } from './intent-detector';
import { SIZE_GUIDE, STYLE_TIPS } from '@/data/chat/style-guide';
import { STATIC_POLICIES } from '@/data/chat/policies';

export async function buildSystemPrompt(userMessage: string): Promise<string> {
  const intent = detectIntent(userMessage);
  let contextData = '';

  try {
    const supabase = await createServerSupabaseClient();

    if (intent === 'product_search') {
      const keywords = extractSearchKeywords(userMessage);
      const { data: products } = await supabase
        .from('products')
        .select('title, base_price, description, product_variants(size, color_name, stock_qty)')
        .eq('published', true)
        .is('deleted_at', null)
        .limit(6);

      if (products?.length) {
        contextData += `\n## Sản phẩm trong kho BN STORE:\n`;
        for (const p of products) {
          const variants = (p.product_variants as any[]) ?? [];
          const sizes = [...new Set(variants.map((v: any) => v.size))].join(', ');
          const colors = [...new Set(variants.map((v: any) => v.color_name))].join(', ');
          const hasStock = variants.some((v: any) => v.stock_qty > 0);
          const price = new Intl.NumberFormat('vi-VN').format(p.base_price);
          contextData += `- **${p.title}**: ${price}đ | Sizes: ${sizes || 'N/A'} | Màu: ${colors || 'N/A'} | ${hasStock ? '✅ Còn hàng' : '❌ Hết hàng'}\n`;
        }
      } else {
        contextData += `\n## Lưu ý: Không tìm thấy sản phẩm khớp với từ khóa. Gợi ý khách xem trang Collections.\n`;
      }
    }

    if (intent === 'promotion') {
      const now = new Date().toISOString();
      const { data: promos } = await supabase
        .from('promotions')
        .select('code, name, description, type, value, min_order_value, expires_at, apply_mode')
        .eq('published', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .limit(5);

      if (promos?.length) {
        contextData += `\n## Khuyến mãi đang áp dụng:\n`;
        for (const p of promos) {
          const discount = p.type === 'percent' ? `${p.value}%` : `${new Intl.NumberFormat('vi-VN').format(p.value)}đ`;
          const code = p.apply_mode === 'code' && p.code ? `Mã: **${p.code}**` : 'Áp dụng tự động';
          contextData += `- ${code} — ${p.name}: Giảm ${discount}`;
          if (p.min_order_value > 0) contextData += ` (Đơn tối thiểu ${new Intl.NumberFormat('vi-VN').format(p.min_order_value)}đ)`;
          if (p.expires_at) contextData += ` | HSD: ${new Date(p.expires_at).toLocaleDateString('vi-VN')}`;
          contextData += '\n';
        }
      } else {
        contextData += `\n## Hiện tại không có khuyến mãi đặc biệt. Thông báo khách theo dõi fanpage để cập nhật.\n`;
      }
    }

    if (intent === 'shipping_policy') {
      const { data: zones } = await supabase
        .from('shipping_zones')
        .select('name, fee, free_above, provinces')
        .eq('published', true);

      if (zones?.length) {
        contextData += `\n## Bảng phí vận chuyển:\n`;
        for (const z of zones) {
          const fee = z.fee === 0 ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(z.fee)}đ`;
          const freeAbove = z.free_above ? ` (Miễn phí đơn từ ${new Intl.NumberFormat('vi-VN').format(z.free_above)}đ)` : '';
          contextData += `- **${z.name}**: ${fee}${freeAbove}\n`;
        }
      }
      contextData += STATIC_POLICIES.shipping;
    }

    if (intent === 'return_policy') {
      contextData += STATIC_POLICIES.returns;
    }

    if (intent === 'size_guide') {
      contextData += SIZE_GUIDE;
    }

    if (intent === 'style_advice') {
      contextData += STYLE_TIPS;
    }

    if (intent === 'membership') {
      const { data: tiers } = await supabase
        .from('membership_tier_config')
        .select('tier, min_spent, discount_percent, benefits')
        .order('min_spent', { ascending: true });

      if (tiers?.length) {
        contextData += `\n## Chương trình thành viên BN STORE:\n`;
        for (const t of tiers) {
          contextData += `- **Hạng ${t.tier}**: Chi tiêu tích lũy từ ${new Intl.NumberFormat('vi-VN').format(Number(t.min_spent))}đ | Giảm ${t.discount_percent}%`;
          if (Array.isArray(t.benefits) && t.benefits.length) contextData += ` | ${(t.benefits as string[]).join(', ')}`;
          contextData += '\n';
        }
      }
    }
  } catch (err) {
    console.error('[ChatBot] Context build error:', err);
    // Continue without DB context
  }

  return `Bạn là trợ lý tư vấn mua hàng AI của **BN STORE** — cửa hàng thời trang hiện đại tại Việt Nam.

## Vai trò:
- Tư vấn sản phẩm, gợi ý phong cách phù hợp với khách hàng
- Hỗ trợ chọn size, màu sắc, cách phối đồ
- Giải đáp chính sách mua hàng, vận chuyển, đổi trả
- Thông báo khuyến mãi đang diễn ra
- Tra cứu thông tin liên quan đến đơn hàng

## Nguyên tắc trả lời:
- Trả lời bằng **tiếng Việt**, thân thiện, nhiệt tình như nhân viên tư vấn thật
- Ngắn gọn, súc tích — không quá 150 từ mỗi tin nhắn
- Luôn gợi ý hành động tiếp theo cụ thể
- Nếu không có thông tin, nói thật và hướng khách liên hệ support
- KHÔNG bịa đặt thông tin sản phẩm, giá, chính sách

## Thông tin BN STORE:
- 🏠 Website: bnstore.vn
- 📞 Hotline: 1800-xxxx (8:00–22:00 hàng ngày)
- 📧 Email: support@bnstore.vn
- 📍 Showroom: TP. Hồ Chí Minh${contextData ? `\n\n## Dữ liệu thực tế từ hệ thống (sử dụng để trả lời chính xác):\n${contextData}` : '\n\nLưu ý: Không có dữ liệu cụ thể cho câu hỏi này. Trả lời dựa trên thông tin chung.'}`.trim();
}
