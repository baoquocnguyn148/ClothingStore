'use client';

import { useEffect, useState } from 'react';

interface AnnouncementBarProps {
  announcements: string[];
}

export function AnnouncementBar({ announcements }: AnnouncementBarProps) {
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
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

  return (
    <div className="sticky top-0 z-50 bg-black text-white py-2.5 text-center text-[13px] md:text-sm font-medium tracking-wide" role="marquee" aria-live="polite">
      <p
        className="transition-all duration-300 ease-in-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-4px)',
        }}
      >
        {text}
      </p>
    </div>
  );
}
