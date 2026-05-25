'use client';

import { useMemo, useState } from 'react';
import type { HomeContentBlock } from '@/lib/home-content/defaults';

interface HomeContentFormProps {
  blocks: HomeContentBlock[];
  notice?: string;
}

export function HomeContentForm({ blocks, notice }: HomeContentFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(blocks.map((block) => [block.key, block.value]))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const groups = new Map<string, HomeContentBlock[]>();
    for (const block of blocks) {
      const group = groups.get(block.section) ?? [];
      group.push(block);
      groups.set(block.section, group);
    }
    return Array.from(groups.entries());
  }, [blocks]);

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/home-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error ?? 'Failed to save home content');
      }

      const savedBlocks = (result.blocks ?? []) as HomeContentBlock[];
      setValues(Object.fromEntries(savedBlocks.map((block) => [block.key, block.value])));
      setMessage('Noi dung trang chu da duoc cap nhat.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save home content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {notice && (
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </div>
      )}

      {grouped.map(([section, sectionBlocks]) => (
        <section key={section} className="admin-card p-6">
          <h2 className="admin-card-title mb-6">{section}</h2>
          <div className="grid gap-5">
            {sectionBlocks.map((block) => (
              <label key={block.key} className="block">
                <span className="block text-sm font-medium mb-2">{block.label}</span>
                {block.type === 'textarea' ? (
                  <textarea
                    value={values[block.key] ?? ''}
                    onChange={(event) => updateValue(block.key, event.target.value)}
                    className="w-full border border-border rounded px-3 py-2 text-sm min-h-24"
                    maxLength={2000}
                  />
                ) : (
                  <input
                    type={block.type === 'url' ? 'text' : 'text'}
                    value={values[block.key] ?? ''}
                    onChange={(event) => updateValue(block.key, event.target.value)}
                    className="w-full border border-border rounded px-3 py-2 text-sm"
                    maxLength={2000}
                  />
                )}
                <span className="mt-1 block text-xs text-gray-500">{block.key}</span>
              </label>
            ))}
          </div>
        </section>
      ))}

      {message && <div className="text-sm text-green-700">{message}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="sticky bottom-0 flex justify-end border-t border-border bg-white py-4">
        <button
          type="submit"
          disabled={saving}
          className="admin-btn admin-btn-primary disabled:opacity-50"
        >
          {saving ? 'Dang luu...' : 'Luu thay doi'}
        </button>
      </div>
    </form>
  );
}
