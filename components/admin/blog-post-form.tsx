'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Plus, Save, Trash2 } from 'lucide-react';

type LinkedProduct = { productId: string; handle: string; title: string };
type SearchProduct = { id: string; handle: string; title: string };

export interface BlogPostFormInitialData {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string; // YYYY-MM-DD or ''
  published: boolean;
  linkedProducts: LinkedProduct[];
}

export function BlogPostForm({ initial }: { initial: BlogPostFormInitialData }) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);

  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [publishedAt, setPublishedAt] = useState(initial.publishedAt);
  const [published, setPublished] = useState(initial.published);
  const [linkedProducts, setLinkedProducts] = useState<LinkedProduct[]>(initial.linkedProducts ?? []);

  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchProduct[]>([]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const assignedIds = useMemo(() => new Set(linkedProducts.map((p) => p.productId)), [linkedProducts]);

  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    fetch(`/api/admin/products?limit=20&offset=0&search=${encodeURIComponent(q)}&published=all`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d) => setResults(d.products ?? []))
      .catch(() => {})
      .finally(() => setSearching(false));
    return () => controller.abort();
  }, [search]);

  const validate = () => {
    if (!slug.trim() || !/^[a-z0-9-]+$/.test(slug.trim())) return 'Slug chi duoc dung chu thuong, so va dau gach ngang.';
    if (!title.trim()) return 'Tieu de la bat buoc.';
    if (!imageUrl.trim()) return 'Can image URL (hoac upload).';
    if (publishedAt.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(publishedAt.trim())) return 'Published date khong dung dinh dang YYYY-MM-DD.';
    return null;
  };

  const uploadImage = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'blog');
      fd.append('name', slug.trim() || title.trim() || 'post');

      const res = await fetch('/api/admin/uploads/content-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || 'Khong the upload anh');
      setImageUrl(data.url);
      setMessage('Anh da duoc upload. Bam Luu de cap nhat bai viet.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the upload anh');
    } finally {
      setUploading(false);
    }
  };

  const addProduct = (p: SearchProduct) => {
    if (assignedIds.has(p.id)) return;
    setLinkedProducts((cur) => [...cur, { productId: p.id, handle: p.handle, title: p.title }]);
  };

  const removeProduct = (productId: string) => {
    setLinkedProducts((cur) => cur.filter((p) => p.productId !== productId));
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

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      excerpt,
      imageUrl: imageUrl.trim(),
      publishedAt: publishedAt.trim() ? publishedAt.trim() : null,
      published,
      linkedProducts: linkedProducts.map((p) => p.productId),
    };

    try {
      const url = isEdit ? `/api/admin/blog-posts/${initial.id}` : '/api/admin/blog-posts';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || 'Khong the luu bai viet');

      setMessage(isEdit ? 'Da cap nhat bai viet.' : 'Da tao bai viet.');
      if (!isEdit && data?.id) {
        router.push(`/admin/blog/${data.id}`);
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
            <h2 className="admin-card-title">Blog post</h2>
            <p className="mt-1 text-sm text-gray-500">Trang se hien thi tai /blog/post/[slug].</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(ev) => setPublished(ev.target.checked)} className="h-4 w-4" />
            Cong khai
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input className="w-full border border-border rounded px-3 py-2 text-sm" value={slug} onChange={(ev) => setSlug(ev.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ngay dang (YYYY-MM-DD)</label>
            <input type="date" className="w-full border border-border rounded px-3 py-2 text-sm" value={publishedAt} onChange={(ev) => setPublishedAt(ev.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tieu de *</label>
          <input className="w-full border border-border rounded px-3 py-2 text-sm" value={title} onChange={(ev) => setTitle(ev.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Excerpt</label>
          <textarea className="w-full border border-border rounded px-3 py-2 text-sm min-h-[120px]" value={excerpt} onChange={(ev) => setExcerpt(ev.target.value)} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium">Image URL *</label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-border px-3 py-1.5 text-xs font-medium hover:border-black">
              <ImagePlus size={14} />
              {uploading ? 'Dang upload...' : 'Chon tu may'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="sr-only"
                disabled={uploading}
                onChange={(ev) => {
                  void uploadImage(ev.target.files?.[0] ?? null);
                  ev.target.value = '';
                }}
              />
            </label>
          </div>
          <input className="w-full border border-border rounded px-3 py-2 text-sm" value={imageUrl} onChange={(ev) => setImageUrl(ev.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div className="admin-card p-6 space-y-4">
        <div>
          <h2 className="admin-card-title">San pham trong outfit</h2>
          <p className="mt-1 text-sm text-gray-500">Chon san pham de hien thi o cuoi bai viet.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input className="w-full border border-border rounded px-3 py-2 text-sm" placeholder="Tim san pham..." value={search} onChange={(ev) => setSearch(ev.target.value)} />
          <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setSearch('')}>
            Xoa tim
          </button>
        </div>

        {searching && <div className="text-sm text-gray-500">Dang tim...</div>}
        {!searching && results.length > 0 && (
          <div className="rounded border border-border overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ten</th>
                  <th>Handle</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.title}</td>
                    <td className="text-sm text-gray-500">{p.handle}</td>
                    <td className="text-right">
                      <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => addProduct(p)} disabled={assignedIds.has(p.id)}>
                        <Plus size={14} className="mr-1" />
                        {assignedIds.has(p.id) ? 'Da them' : 'Them'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {linkedProducts.length === 0 ? (
          <div className="text-sm text-gray-600">Chua co san pham nao.</div>
        ) : (
          <div className="rounded border border-border overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ten</th>
                  <th>Handle</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {linkedProducts.map((p) => (
                  <tr key={p.productId}>
                    <td className="font-medium">{p.title}</td>
                    <td className="text-sm text-gray-500">{p.handle}</td>
                    <td className="text-right">
                      <button type="button" className="admin-btn-icon admin-btn-secondary" onClick={() => removeProduct(p.productId)} aria-label="Xoa">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && <div className="text-sm text-green-600">{message}</div>}

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-white py-4">
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary disabled:opacity-50">
          <Save size={16} className="mr-2" />
          {saving ? 'Dang luu...' : 'Luu bai viet'}
        </button>
      </div>
    </form>
  );
}

