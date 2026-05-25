'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, Plus, Save, Trash2 } from 'lucide-react';

type AssignedProduct = {
  productId: string;
  handle: string;
  title: string;
  sortOrder: number;
};

type SearchProduct = {
  id: string;
  handle: string;
  title: string;
  primaryImage?: string | null;
};

export interface CollectionFormInitialData {
  id?: string;
  handle: string;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  published: boolean;
  products: AssignedProduct[];
}

export function CollectionForm({ initial }: { initial: CollectionFormInitialData }) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);

  const [handle, setHandle] = useState(initial.handle);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [sortOrder, setSortOrder] = useState(String(initial.sortOrder ?? 0));
  const [published, setPublished] = useState(initial.published);
  const [products, setProducts] = useState<AssignedProduct[]>(initial.products ?? []);

  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchProduct[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const assignedIds = useMemo(() => new Set(products.map((p) => p.productId)), [products]);

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

  const move = (index: number, delta: number) => {
    setProducts((current) => {
      const next = [...current];
      const to = index + delta;
      if (to < 0 || to >= next.length) return current;
      const tmp = next[index];
      next[index] = next[to];
      next[to] = tmp;
      return next.map((p, i) => ({ ...p, sortOrder: i }));
    });
  };

  const remove = (productId: string) => {
    setProducts((current) => current.filter((p) => p.productId !== productId).map((p, i) => ({ ...p, sortOrder: i })));
  };

  const add = (p: SearchProduct) => {
    if (assignedIds.has(p.id)) return;
    setProducts((current) => [...current, { productId: p.id, handle: p.handle, title: p.title, sortOrder: current.length }]);
  };

  const validate = () => {
    if (!handle.trim() || !/^[a-z0-9-]+$/.test(handle.trim())) return 'Handle chi duoc dung chu thuong, so va dau gach ngang.';
    if (!title.trim()) return 'Ten collection la bat buoc.';
    const so = Number(sortOrder);
    if (Number.isNaN(so) || so < 0) return 'Sort order khong hop le.';
    if (imageUrl.trim() && !/^https?:\/\//.test(imageUrl.trim()) && !imageUrl.trim().startsWith('/')) return 'Image URL phai bat dau bang http(s) hoac /.';
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

    const payload = {
      handle: handle.trim(),
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
      sortOrder: Number(sortOrder),
      published,
      products: products.map((p, i) => ({ productId: p.productId, sortOrder: i })),
    };

    try {
      const url = isEdit ? `/api/admin/collections/${initial.id}` : '/api/admin/collections';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || 'Khong the luu collection');

      setMessage(isEdit ? 'Da cap nhat collection.' : 'Da tao collection.');
      if (!isEdit && data?.id) {
        router.push(`/admin/collections/${data.id}`);
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
            <h2 className="admin-card-title">Thong tin collection</h2>
            <p className="mt-1 text-sm text-gray-500">Dung cho merchandising va trang collections.</p>
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
            <label className="block text-sm font-medium mb-2">Handle *</label>
            <input
              className="w-full border border-border rounded px-3 py-2 text-sm"
              value={handle}
              onChange={(ev) => setHandle(ev.target.value)}
              placeholder="ao-thun"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sort order</label>
            <input
              type="number"
              min={0}
              className="w-full border border-border rounded px-3 py-2 text-sm"
              value={sortOrder}
              onChange={(ev) => setSortOrder(ev.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ten collection *</label>
          <input
            className="w-full border border-border rounded px-3 py-2 text-sm"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mo ta</label>
          <textarea
            className="w-full border border-border rounded px-3 py-2 text-sm min-h-[120px]"
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            className="w-full border border-border rounded px-3 py-2 text-sm"
            value={imageUrl}
            onChange={(ev) => setImageUrl(ev.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="admin-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="admin-card-title">San pham trong collection</h2>
            <p className="mt-1 text-sm text-gray-500">Tim san pham va them vao collection; co the sap xep thu tu.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="w-full border border-border rounded px-3 py-2 text-sm"
            placeholder="Tim san pham theo ten..."
            value={search}
            onChange={(ev) => setSearch(ev.target.value)}
          />
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
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => add(p)}
                        disabled={assignedIds.has(p.id)}
                      >
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

        {products.length === 0 ? (
          <div className="text-sm text-gray-600">Chua co san pham nao trong collection.</div>
        ) : (
          <div className="rounded border border-border overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ten</th>
                  <th>Handle</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={p.productId}>
                    <td className="admin-table-mono">{idx + 1}</td>
                    <td className="font-medium">{p.title}</td>
                    <td className="text-sm text-gray-500">{p.handle}</td>
                    <td className="text-right">
                      <div className="inline-flex gap-2">
                        <button type="button" className="admin-btn-icon admin-btn-secondary" onClick={() => move(idx, -1)} aria-label="Len">
                          <ArrowUp size={16} />
                        </button>
                        <button type="button" className="admin-btn-icon admin-btn-secondary" onClick={() => move(idx, 1)} aria-label="Xuong">
                          <ArrowDown size={16} />
                        </button>
                        <button type="button" className="admin-btn-icon admin-btn-secondary" onClick={() => remove(p.productId)} aria-label="Xoa">
                          <Trash2 size={16} />
                        </button>
                      </div>
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
          {saving ? 'Dang luu...' : 'Luu collection'}
        </button>
      </div>
    </form>
  );
}

