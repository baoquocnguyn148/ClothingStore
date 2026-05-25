'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-10 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white border-b border-[#E5E5E5]' : 'bg-[#F4F4F4]'
      }`}
    >
      <div className="container-mqb py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl md:text-3xl font-bold tracking-tight">
          MQB
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#" className="hover:opacity-60 transition">
            NEW
          </a>
          <a href="#" className="hover:opacity-60 transition">
            BEST SELLER
          </a>
          <a href="#" className="hover:opacity-60 transition">
            COLLECTION
          </a>
          <a href="#" className="hover:opacity-60 transition">
            ABOUT
          </a>
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-4 md:gap-6">
          <button className="p-2 hover:opacity-60 transition">
            <Search size={20} />
          </button>
          <button className="p-2 hover:opacity-60 transition relative">
            <ShoppingCart size={20} />
            <span className="absolute top-0 right-0 bg-[#FF3B30] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </button>
          <button className="p-2 hover:opacity-60 transition">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
