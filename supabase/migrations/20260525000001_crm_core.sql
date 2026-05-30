-- CRM Core: customer notes, follow-up tasks, and support tickets.
-- Admin access is handled through service-role API routes.

CREATE TYPE crm_task_status AS ENUM ('open', 'done', 'cancelled');
CREATE TYPE crm_task_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE crm_ticket_status AS ENUM ('open', 'pending', 'resolved', 'closed');
CREATE TYPE crm_ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');

CREATE TABLE crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  due_at TIMESTAMPTZ,
  status crm_task_status NOT NULL DEFAULT 'open',
  priority crm_task_priority NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crm_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT,
  status crm_ticket_status NOT NULL DEFAULT 'open',
  priority crm_ticket_priority NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_notes_customer ON crm_notes(customer_user_id, created_at DESC);
CREATE INDEX idx_crm_tasks_customer ON crm_tasks(customer_user_id, status, due_at);
CREATE INDEX idx_crm_tasks_status ON crm_tasks(status, due_at);
CREATE INDEX idx_crm_tickets_customer ON crm_tickets(customer_user_id, status, created_at DESC);
CREATE INDEX idx_crm_tickets_status ON crm_tickets(status, priority, created_at DESC);

CREATE TRIGGER crm_tasks_updated_at BEFORE UPDATE ON crm_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER crm_tickets_updated_at BEFORE UPDATE ON crm_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on crm notes" ON crm_notes USING (true);
CREATE POLICY "Service role full access on crm tasks" ON crm_tasks USING (true);
CREATE POLICY "Service role full access on crm tickets" ON crm_tickets USING (true);
