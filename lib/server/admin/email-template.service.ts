import { createAdminClient } from '@/lib/supabase/admin';

export interface EmailTemplate {
  id: string;
  type: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export class EmailTemplateService {
  private db = createAdminClient();

  async getTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await this.db
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await this.db
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async updateTemplate(id: string, input: { subject: string; body: string }) {
    const { data, error } = await this.db
      .from('email_templates')
      .update({ subject: input.subject, body: input.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
