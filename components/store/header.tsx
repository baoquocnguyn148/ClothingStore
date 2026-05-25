'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Menu, Search, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { useWishlist } from '@/lib/wishlist/wishlist-context';
import { BRAND } from '@/lib/brand';
import { UserMenu } from './user-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { href: '/collections?tag=new', label: 'NEW ARRIVALS' },
  { href: '/collections?tag=best-seller', label: 'BEST SELLERS' },
  { href: '/collections', label: 'SHOP' },
  { href: '/about-us', label: 'ABOUT US' },
];

function CountBadge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow-sm">
      {value}
    </span>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-10 z-40 transition-all duration-300 ${
        isScrolled ? 'border-b border-border bg-white/95 shadow-sm backdrop-blur-md' : 'bg-muted'
      }`}
    >
      <div className="container-mqb flex items-center justify-between py-4">
        <Link href="/" className="text-2xl font-black tracking-[-0.04em] transition-opacity hover:opacity-80 md:text-3xl">
          {BRAND.name}
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold tracking-[-0.01em] md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-2 transition-colors hover:text-black/70 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <Link
            href="/search"
            className="rounded-full p-2.5 transition-all hover:bg-black/5"
            aria-label="Tìm kiếm"
          >
            <Search size={20} />
          </Link>
          <Link
            href="/account/wishlist"
            className="relative hidden rounded-full p-2.5 transition-all hover:bg-black/5 sm:block"
            aria-label="Yêu thích"
          >
            <Heart size={20} />
            <CountBadge value={wishlistCount} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-2.5 transition-all hover:bg-black/5"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart size={20} />
            <CountBadge value={itemCount} />
          </button>
          <UserMenu />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button type="button" aria-label="Menu" className="rounded-full p-2.5 transition-all hover:bg-black/5">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-2xl font-black tracking-[-0.04em]">
                {BRAND.name}
              </Link>
              <nav className="mt-10 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-semibold uppercase transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border" />
                <Link
                  href="/account/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                >
                  Yêu thích
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                >
                  Tài khoản
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                >
                  Outfit
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
