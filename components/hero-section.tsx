'use client';

import { useState } from 'react';
import Image from 'next/image';

export function HeroSection() {
  const [showModal, setShowModal] = useState(true);

  return (
    <section className="w-full bg-white py-0 relative">
      {/* Hero Image Background */}
      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[750px] overflow-hidden">
        <Image
          src="/images/banners/banner1.png"
          alt="Hero Banner"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Overlay Modal */}
      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-8 md:p-12 w-full max-w-md md:max-w-lg shadow-lg">
            {/* Modal Header Image */}
            <div className="w-full h-32 md:h-40 bg-gradient-to-b from-gray-800 to-gray-400 mb-6 rounded-sm"></div>
            
            {/* Xem sản phẩm */}
            <div className="text-center mb-6">
              <p className="text-sm md:text-base text-black font-medium">Xem sản phẩm</p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button className="w-full btn-primary">COLLECT NOW</button>
              <button className="w-full btn-primary">COLLECT NOW</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
