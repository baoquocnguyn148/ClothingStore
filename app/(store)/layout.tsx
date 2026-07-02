import { AnnouncementBar } from '@/components/store/announcement-bar';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { CartDrawer } from '@/components/store/cart-drawer';
import { ChatWidget } from '@/components/store/chat-widget';
import { getHomeContentMap } from '@/lib/home-content/server';
import { getHomeText } from '@/lib/home-content/defaults';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getHomeContentMap();
  const announcements = [1, 2, 3, 4].map((index) =>
    getHomeText(content, `announcement.${index}`)
  );

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
      {/* AI Customer Support Chatbot — powered by LM Studio */}
      <ChatWidget />
    </>
  );
}
