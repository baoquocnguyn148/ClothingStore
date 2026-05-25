import { notFound } from 'next/navigation';
import { getCommerceClient } from '@/lib/commerce/get-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = await getCommerceClient().getPolicyBySlug(slug);
  return { title: policy?.title ?? 'Page' };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = await getCommerceClient().getPolicyBySlug(slug);
  const isSizeGuide = slug === 'size-guide';

  if (!policy && !isSizeGuide) notFound();

  return (
    <div className="container-mqb py-12 md:py-16 max-w-3xl">
      <h1 className="text-heading-lg uppercase mb-8">
        {policy?.title ?? 'Hướng dẫn đo size'}
      </h1>

      {isSizeGuide ? (
        <div className="space-y-8 text-secondary">
          <p className="text-base leading-7">Bảng size tham khảo dưới đây dựa trên các số đo tiêu chuẩn và giúp bạn chọn được size phù hợp nhất cho Sơ mi Form Classic.</p>

          <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <table className="w-full table-fixed border-collapse text-sm text-left text-neutral-700">
              <thead>
                <tr className="bg-black text-white uppercase text-xs tracking-[0.18em] font-semibold">
                  <th className="px-3 py-4 border border-black/10">Size</th>
                  <th className="px-3 py-4 border border-black/10">Chiều cao (cm)</th>
                  <th className="px-3 py-4 border border-black/10">Cân nặng (kg)</th>
                  <th className="px-3 py-4 border border-black/10">Vòng ngực</th>
                  <th className="px-3 py-4 border border-black/10">Vòng eo</th>
                  <th className="px-3 py-4 border border-black/10">Vòng gấu</th>
                  <th className="px-3 py-4 border border-black/10">Dài áo</th>
                  <th className="px-3 py-4 border border-black/10">Dài tay (Tay ngắn)</th>
                  <th className="px-3 py-4 border border-black/10">Dài tay (Tay dài)</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[
                  ['S', 'Dưới 1m65', '52 - 59kg', '105', '104', '106', '72', '22', '61,5'],
                  ['M', '1m65 - 1m75', '60 - 65kg', '109', '108', '110', '73,5', '23', '62,5'],
                  ['L', '1m65 - 1m75', '66 - 71kg', '113', '112', '114', '75', '24', '63,5'],
                  ['XL', '1m75 - 1m85', '72 - 77kg', '117', '116', '118', '76,5', '25', '64,5'],
                  ['XXL', '1m75 - 1m85', '78 - 83kg', '121', '120', '122', '78', '26', '65,5'],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-neutral-200 hover:bg-neutral-50 transition-colors">
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className="px-3 py-4 border border-neutral-200 font-medium text-neutral-800 break-words">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="prose prose-sm max-w-none text-secondary leading-relaxed [&_p]:mb-4"
          dangerouslySetInnerHTML={{ __html: policy?.content || '' }}
        />
      )}
    </div>
  );
}
