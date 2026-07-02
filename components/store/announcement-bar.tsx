'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AnnouncementBarProps {
  announcements: string[];
}

export function AnnouncementBar({ announcements }: AnnouncementBarProps) {
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const items = announcements.filter(Boolean);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % items.length);
        setIsVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  const text = items[current % Math.max(items.length, 1)] ?? '';

  if (isDismissed || items.length === 0) return null;

  return (
    <div className="sticky top-0 z-50 bg-black text-white py-2.5 text-center text-[13px] md:text-sm font-medium tracking-wide flex items-center justify-center px-8" role="marquee" aria-live="polite">
      <p
        className="transition-all duration-300 ease-in-out flex-1"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-4px)',
        }}
      >
        {text}
      </p>
      <button 
        onClick={() => setIsDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        aria-label="Đóng thông báo"
      >
        <X size={16} />
      </button>
    </div>
  );
}
