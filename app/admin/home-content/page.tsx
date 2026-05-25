import { HomeContentForm } from '@/components/admin/home-content-form';
import { HOME_CONTENT_DEFAULTS } from '@/lib/home-content/defaults';
import { HomeContentService } from '@/lib/server/content/home-content.service';

export const metadata = { title: 'Noi dung Home - Admin B&D' };
export const dynamic = 'force-dynamic';

export default async function AdminHomeContentPage() {
  let blocks = HOME_CONTENT_DEFAULTS;
  let notice: string | undefined;

  try {
    blocks = await new HomeContentService().listBlocks();
  } catch (error) {
    notice =
      error instanceof Error
        ? `Dang hien thi noi dung mac dinh vi chua doc duoc du lieu: ${error.message}`
        : 'Dang hien thi noi dung mac dinh vi chua doc duoc du lieu.';
  }

  return (
    <div className="admin-page max-w-5xl">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Noi dung Home</h1>
          <p className="admin-page-subtitle">
            Chinh sua cac dong chu dang hien thi tren trang chu.
          </p>
        </div>
      </div>

      <HomeContentForm blocks={blocks} notice={notice} />
    </div>
  );
}
