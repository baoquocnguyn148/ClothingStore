import Link from 'next/link';
import { XCircle, RefreshCcw, HeadphonesIcon } from 'lucide-react';

export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <XCircle size={56} className="text-red-500" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">
        Thanh toán thất bại
      </h1>
      
      <p className="text-gray-500 max-w-md mb-8">
        Rất tiếc, giao dịch của bạn không thành công hoặc đã bị huỷ. 
        Tài khoản của bạn chưa bị trừ tiền. Vui lòng thử lại.
      </p>

      {order && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Mã tham chiếu đơn hàng</p>
          <p className="font-bold font-mono text-gray-900">{order}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Link 
          href="/checkout" 
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors w-full sm:w-auto"
        >
          <RefreshCcw size={18} />
          Thử thanh toán lại
        </Link>
        
        <Link 
          href="/pages/contact" 
          className="flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-gray-200 font-bold rounded-xl hover:border-gray-300 transition-colors w-full sm:w-auto"
        >
          <HeadphonesIcon size={18} />
          Liên hệ hỗ trợ
        </Link>
      </div>
    </div>
  );
}
