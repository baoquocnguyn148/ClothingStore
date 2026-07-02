import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

export class EmailService {
  private db = createAdminClient();

  async sendOrderConfirmation(params: {
    toEmail: string;
    customerName: string;
    orderNumber: string;
    orderTotal: number;
    items: { title: string; quantity: number; price: number }[];
  }) {
    const { data: template } = await this.db
      .from('email_templates')
      .select('subject, body')
      .eq('type', 'order_confirmation')
      .single();

    const subject = template
      ? interpolate(template.subject, { order_number: params.orderNumber })
      : `Xác nhận đơn hàng ${params.orderNumber}`;

    const itemsHtml = params.items
      .map(i => `<li>${i.title} × ${i.quantity} — ${i.price.toLocaleString('vi-VN')}₫</li>`)
      .join('');

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">🎉 Đặt hàng thành công!</h2>
        <p>Xin chào <strong>${params.customerName}</strong>,</p>
        <p>Đơn hàng <strong>#${params.orderNumber}</strong> của bạn đã được xác nhận.</p>
        <h3>Chi tiết đơn hàng:</h3>
        <ul>${itemsHtml}</ul>
        <p style="font-size: 18px;"><strong>Tổng cộng: ${params.orderTotal.toLocaleString('vi-VN')}₫</strong></p>
        <p>Chúng tôi sẽ thông báo khi đơn hàng được giao. Cảm ơn bạn đã mua sắm!</p>
        <hr/>
        <p style="color: #999; font-size: 12px;">B&D Fashion — Thời trang cao cấp</p>
      </div>
    `;

    if (!resend) {
      console.warn('[EmailService] RESEND_API_KEY not configured. Skipping order confirmation email.');
      return;
    }

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@resend.dev',
      to: params.toEmail,
      subject,
      html,
    });

    if (error) {
      console.error('[EmailService] Failed to send order confirmation:', error);
    }
  }

  async sendOrderStatusUpdate(params: {
    toEmail: string;
    customerName: string;
    orderNumber: string;
    newStatus: string;
    trackingNumber?: string;
  }) {
    const statusLabels: Record<string, string> = {
      confirmed: 'đã được xác nhận',
      shipping: 'đang được vận chuyển',
      delivered: 'đã giao thành công',
      cancelled: 'đã bị hủy',
    };

    const label = statusLabels[params.newStatus] ?? params.newStatus;
    
    const templateType = params.newStatus === 'shipping'
      ? 'order_shipped'
      : params.newStatus === 'cancelled'
      ? 'order_cancelled'
      : 'order_confirmation';

    const { data: template } = await this.db
      .from('email_templates')
      .select('subject, body')
      .eq('type', templateType)
      .single();

    const subject = template
      ? interpolate(template.subject, { order_number: params.orderNumber })
      : `Đơn hàng #${params.orderNumber} ${label}`;

    const body = template
      ? interpolate(template.body, {
          customer_name: params.customerName,
          order_number: params.orderNumber,
          tracking_number: params.trackingNumber ?? 'Đang cập nhật',
        })
      : `Đơn hàng #${params.orderNumber} của bạn ${label}.`;

    if (!resend) {
      console.warn('[EmailService] RESEND_API_KEY not configured. Skipping status update email.');
      return;
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@resend.dev',
      to: params.toEmail,
      subject,
      html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
    });
  }
}
