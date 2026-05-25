'use client';

import { useState, useEffect } from 'react';

const announcements = [
  'FOR DREAMERS ONLY',
  'MQB X COLLABORATION',
  'NEW COLLECTION DROPPING SOON',
  'LIMITED EDITION ITEMS',
];

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-black text-white py-2 text-center text-sm md:text-base font-medium">
      <p className="animate-pulse">{announcements[current]}</p>
    </div>
  );
}
