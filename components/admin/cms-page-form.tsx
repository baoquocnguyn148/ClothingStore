'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save } from 'lucide-react';

export interface CmsPageFormInitialData {
  id?: string;
  slug: string;
  title: string;
  htmlContent: string;
  published: boolean;
}

export function CmsPageForm({ initial }: { initial: CmsPageFormInitialData }) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);

  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  const [htmlContent, setHtmlContent] = useState(initial.htmlContent);
  const [published, setPublished] = useState(initial.published);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const validate = () => {
    if (!slug.trim() || !/^[a-z0-9-]+$/.test(slug.trim())) return 'Slug chi duoc dung chu thuong, so va dau gach ngang.';
    if (!title.trim()) return 'Tieu de la bat buoc.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const v = validate();
    if (v) {
      setError(v);
      setSaving(false);
      return;
    }

    const payload = { slug: slug.trim(), title: title.trim(), htmlContent, published };

    try {
      const url = isEdit ? `/api/admin/cms-pages/${initial.id}` : '/api/admin/cms-pages';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || 'Khong the luu page');

      setMessage(isEdit ? 'Da cap nhat page.' : 'Da tao page.');
      if (!isEdit && data?.id) {
        router.push(`/admin/pages/${data.id}`);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loi khong xac dinh');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="admin-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="admin-card-title">CMS page</h2>
            <p className="mt-1 text-sm text-gray-500">Noi dung se duoc render tren /pages/[slug].</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(ev) => setPublished(ev.target.checked)}
              className="h-4 w-4"
            />
            Cong khai
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input
              className="w-full border border-border rounded px-3 py-2 text-sm"
              value={slug}
              onChange={(ev) => setSlug(ev.target.value)}
              placeholder="shipping-policy"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tieu de *</label>
            <input
              className="w-full border border-border rounded px-3 py-2 text-sm"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">HTML content</label>
          <textarea
            className="w-full border border-border rounded px-3 py-2 text-sm min-h-[340px] font-mono"
            value={htmlContent}
            onChange={(ev) => setHtmlContent(ev.target.value)}
            placeholder="<p>...</p>"
          />
          <p className="mt-2 text-xs text-gray-500">Ban co the dan HTML truc tiep (p, h2, ul...).</p>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && <div className="text-sm text-green-600">{message}</div>}

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-white py-4">
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary disabled:opacity-50">
          <Save size={16} className="mr-2" />
          {saving ? 'Dang luu...' : 'Luu page'}
        </button>
      </div>
    </form>
  );
}

