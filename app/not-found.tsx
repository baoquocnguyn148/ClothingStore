import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-heading-lg uppercase">404</h1>
      <p className="text-secondary">Trang không tồn tại</p>
      <Link href="/" className="btn-primary">
        Về trang chủ
      </Link>
    </div>
  );
}
