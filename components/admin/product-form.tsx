'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';

interface ProductImageAdmin {
  id?: string;
  url: string;
  alt: string;
  sortOrder: number;
}

interface ProductVariantAdmin {
  id?: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  stockQty: number;
  isActive: boolean;
}

interface ProductAdmin {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  category: string;
  published: boolean;
  tags?: string[];
  images?: ProductImageAdmin[];
  variants?: ProductVariantAdmin[];
}

interface ProductFormProps {
  product?: ProductAdmin;
}

const emptyImage = (sortOrder: number): ProductImageAdmin => ({
  url: '',
  alt: '',
  sortOrder,
});

const emptyVariant = (index: number, basePrice: number): ProductVariantAdmin => ({
  sku: `SKU-${Date.now()}-${index}`,
  size: '',
  colorName: '',
  colorHex: '#000000',
  price: basePrice,
  stockQty: 0,
  isActive: true,
});

function normalizeMoney(value: string): number {
  return Number(value || 0);
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [handle, setHandle] = useState(product?.handle ?? '');
  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [basePrice, setBasePrice] = useState(String(product?.basePrice ?? 0));
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice != null ? String(product.compareAtPrice) : ''
  );
  const [category, setCategory] = useState(product?.category ?? 'general');
  const [published, setPublished] = useState(product?.published ?? false);
  const [images, setImages] = useState<ProductImageAdmin[]>(
    product?.images?.length ? product.images : [emptyImage(0)]
  );
  const [variants, setVariants] = useState<ProductVariantAdmin[]>(
    product?.variants?.length ? product.variants : [emptyVariant(0, product?.basePrice ?? 0)]
  );
  const [availableTags, setAvailableTags] = useState<Array<{ slug: string; label: string }>>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(product?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalStock = useMemo(
    () => variants.reduce((sum, variant) => sum + Number(variant.stockQty || 0), 0),
    [variants]
  );

  useEffect(() => {
    if (!product) return;
    setHandle(product.handle);
    setTitle(product.title);
    setDescription(product.description ?? '');
    setBasePrice(String(product.basePrice ?? 0));
    setCompareAtPrice(product.compareAtPrice != null ? String(product.compareAtPrice) : '');
    setCategory(product.category ?? 'general');
    setPublished(product.published ?? false);
    setSelectedTags(product.tags ?? []);
    setImages(product.images?.length ? product.images : [emptyImage(0)]);
    setVariants(product.variants?.length ? product.variants : [emptyVariant(0, product.basePrice ?? 0)]);
  }, [product]);

  useEffect(() => {
    fetch('/api/admin/tags')
      .then((r) => r.json())
      .then((d) => setAvailableTags(d.tags ?? []))
      .catch(() => {});
  }, []);

  const updateImage = (index: number, patch: Partial<ProductImageAdmin>) => {
    setImages((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...patch } : image
      )
    );
  };

  const removeImage = (index: number) => {
    setImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index).map((image, sortOrder) => ({
        ...image,
        sortOrder,
      }))
    );
  };

  const uploadImage = async (index: number, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui long chon file anh hop le.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Anh khong duoc vuot qua 5MB.');
      return;
    }

    setUploadingImage(index);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('handle', handle.trim() || title.trim() || 'product');

      const response = await fetch('/api/admin/uploads/product-image', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error ?? 'Khong the upload anh');
      }

      updateImage(index, {
        url: result.url,
        alt: images[index]?.alt || title || file.name,
      });
      setMessage('Anh da duoc upload. Bam Cap nhat san pham de luu thay doi.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the upload anh');
    } finally {
      setUploadingImage(null);
    }
  };

  const updateVariant = (index: number, patch: Partial<ProductVariantAdmin>) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant
      )
    );
  };

  const removeVariant = (index: number) => {
    setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index));
  };

  const validate = () => {
    if (!handle.trim() || !/^[a-z0-9-]+$/.test(handle.trim())) {
      return 'Handle chi duoc dung chu thuong, so va dau gach ngang.';
    }
    if (!title.trim()) return 'Ten san pham la bat buoc.';
    if (normalizeMoney(basePrice) < 0) return 'Gia co ban khong duoc am.';
    if (compareAtPrice !== '' && normalizeMoney(compareAtPrice) < normalizeMoney(basePrice)) {
      return 'Gia so sanh nen lon hon hoac bang gia co ban.';
    }

    const validImages = images.filter((image) => image.url.trim());
    const badImage = validImages.find((image) => !/^https?:\/\//.test(image.url) && !image.url.startsWith('/'));
    if (badImage) return 'URL anh phai bat dau bang http(s) hoac /.';

    const activeVariants = variants.filter((variant) => variant.isActive);
    if (activeVariants.length === 0) return 'Can it nhat 1 bien the dang hoat dong.';

    const duplicateSku = activeVariants.find((variant, index) =>
      activeVariants.some((other, otherIndex) => otherIndex !== index && other.sku.trim() === variant.sku.trim())
    );
    if (duplicateSku) return `SKU bi trung: ${duplicateSku.sku}`;

    for (const variant of activeVariants) {
      if (!variant.sku.trim()) return 'SKU la bat buoc cho moi bien the.';
      if (!variant.size.trim()) return `Bien the ${variant.sku} chua co size.`;
      if (!variant.colorName.trim()) return `Bien the ${variant.sku} chua co mau.`;
      if (Number(variant.price) < 0) return `Gia cua ${variant.sku} khong duoc am.`;
      if (Number(variant.stockQty) < 0) return `Ton kho cua ${variant.sku} khong duoc am.`;
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    const payload = {
      handle: handle.trim(),
      title: title.trim(),
      description,
      basePrice: normalizeMoney(basePrice),
      compareAtPrice: compareAtPrice === '' ? null : normalizeMoney(compareAtPrice),
      category: category.trim() || 'general',
      published,
      tags: selectedTags,
      images: images
        .filter((image) => image.url.trim())
        .map((image, index) => ({
          id: image.id,
          url: image.url.trim(),
          alt: image.alt.trim(),
          sortOrder: index,
        })),
      variants: variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku.trim(),
        size: variant.size.trim(),
        colorName: variant.colorName.trim(),
        colorHex: variant.colorHex || '#000000',
        price: Number(variant.price || 0),
        stockQty: Number(variant.stockQty || 0),
        isActive: variant.isActive,
      })),
    };

    try {
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = product ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result?.message || result?.error || 'Khong the luu san pham');
        return;
      }

      if (product) {
        setMessage('Da cap nhat san pham.');
        router.refresh();
      } else {
        const created = result.product;
        if (created?.id) {
          router.push(`/admin/products/${created.id}`);
          return;
        }
        setMessage('Da tao san pham.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loi mang');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (slug: string) => {
    setSelectedTags((current) =>
      current.includes(slug) ? current.filter((t) => t !== slug) : [...current, slug]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="admin-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="admin-card-title">Thong tin san pham</h2>
            <p className="mt-1 text-sm text-gray-500">Gia hien thi tren storefront lay tu gia variant thap nhat.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="h-4 w-4"
            />
            Cong khai
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2">Handle *</label>
            <input
              type="text"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm"
              placeholder="ao-thun-basic"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Danh muc</label>
            <input
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm"
              placeholder="general"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2">Ten san pham *</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Gia co ban (VND) *</label>
            <input
              type="number"
              value={basePrice}
              onChange={(event) => setBasePrice(event.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm"
              min={0}
              required
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2">Gia so sanh (VND)</label>
            <input
              type="number"
              value={compareAtPrice}
              onChange={(event) => setCompareAtPrice(event.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm"
              min={0}
            />
          </div>
          <div className="rounded border border-border px-4 py-3 text-sm">
            <span className="text-gray-500">Tong ton kho:</span>
            <strong className="ml-2">{totalStock}</strong>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Mo ta</label>
          <textarea
            value={description ?? ''}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full border border-border rounded px-3 py-2 text-sm min-h-[140px]"
            rows={6}
          />
        </div>
      </div>

      <div className="admin-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="admin-card-title">Tag san pham</h2>
            <p className="mt-1 text-sm text-gray-500">Su dung tag de gan nhan (new/sale/...).</p>
          </div>
        </div>

        {availableTags.length === 0 ? (
          <div className="mt-4 text-sm text-gray-600">Chua co tag (hoac chua ket noi Supabase).</div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {availableTags.map((t) => {
              const checked = selectedTags.includes(t.slug);
              return (
                <label key={t.slug} className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTag(t.slug)}
                    className="h-4 w-4"
                  />
                  <span
                    className={`rounded border px-2 py-1 ${
                      checked ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                    }`}
                  >
                    {t.label || t.slug}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="admin-card p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="admin-card-title">Anh san pham</h2>
          <button
            type="button"
            onClick={() => setImages((current) => [...current, emptyImage(current.length)])}
            className="admin-btn admin-btn-secondary"
          >
            <Plus size={16} /> Them anh
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {images.map((image, index) => (
            <div key={image.id ?? index} className="grid gap-4 rounded border border-border p-4 lg:grid-cols-[112px_1fr_220px_44px]">
              <div className="relative h-28 w-28 overflow-hidden rounded border border-border bg-gray-50">
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={image.alt || title || 'Product image'}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <ImagePlus size={24} />
                  </div>
                )}
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium">URL anh #{index + 1}</label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-border px-3 py-1.5 text-xs font-medium hover:border-black">
                    {uploadingImage === index ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ImagePlus size={14} />
                    )}
                    Chon tu may
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      className="sr-only"
                      disabled={uploadingImage !== null}
                      onChange={(event) => {
                        void uploadImage(index, event.target.files?.[0] ?? null);
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={image.url}
                  onChange={(event) => updateImage(index, { url: event.target.value })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  placeholder="/images/products/example.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Alt text</label>
                <input
                  type="text"
                  value={image.alt}
                  onChange={(event) => updateImage(index, { alt: event.target.value })}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                  placeholder={title}
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="admin-btn-icon admin-btn-secondary self-end"
                aria-label="Xoa anh"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="admin-card-title">Bien the, gia va ton kho</h2>
            <p className="mt-1 text-sm text-gray-500">Moi size/mau nen co SKU rieng de tinh ton kho chinh xac.</p>
          </div>
          <button
            type="button"
            onClick={() => setVariants((current) => [...current, emptyVariant(current.length, normalizeMoney(basePrice))])}
            className="admin-btn admin-btn-secondary"
          >
            <Plus size={16} /> Them bien the
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="admin-table min-w-[980px]">
            <thead>
              <tr>
                <th>Active</th>
                <th>SKU</th>
                <th>Size</th>
                <th>Mau</th>
                <th>Hex</th>
                <th>Gia</th>
                <th>Ton</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr key={variant.id ?? index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={variant.isActive}
                      onChange={(event) => updateVariant(index, { isActive: event.target.checked })}
                      className="h-4 w-4"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(event) => updateVariant(index, { sku: event.target.value })}
                      className="w-full min-w-36 border border-border rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(event) => updateVariant(index, { size: event.target.value })}
                      className="w-full min-w-20 border border-border rounded px-2 py-1 text-sm"
                      placeholder="M"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={variant.colorName}
                      onChange={(event) => updateVariant(index, { colorName: event.target.value })}
                      className="w-full min-w-28 border border-border rounded px-2 py-1 text-sm"
                      placeholder="Black"
                    />
                  </td>
                  <td>
                    <input
                      type="color"
                      value={variant.colorHex}
                      onChange={(event) => updateVariant(index, { colorHex: event.target.value })}
                      className="h-9 w-12 rounded border border-border bg-white"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(event) => updateVariant(index, { price: Number(event.target.value) })}
                      className="w-full min-w-28 border border-border rounded px-2 py-1 text-sm"
                      min={0}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={variant.stockQty}
                      onChange={(event) => updateVariant(index, { stockQty: Number(event.target.value) })}
                      className="w-full min-w-24 border border-border rounded px-2 py-1 text-sm"
                      min={0}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="admin-btn-icon admin-btn-secondary"
                      aria-label="Xoa bien the"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {message && <div className="text-sm text-green-600">{message}</div>}

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-white py-4">
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary disabled:opacity-50">
          {saving ? 'Dang luu...' : product ? 'Cap nhat san pham' : 'Tao san pham'}
        </button>
      </div>
    </form>
  );
}
