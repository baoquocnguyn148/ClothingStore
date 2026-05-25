'use client';

import { Play } from 'lucide-react';

export function CollectionFeature() {
  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="container-mqb">
        {/* STYLING Collection */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-heading-lg uppercase">STYLING</h2>
            <a
              href="#"
              className="text-xs md:text-sm font-bold bg-black text-white px-4 py-2 hover:opacity-80 transition"
            >
              Xem lại cả bộ sưu tập
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-square bg-muted rounded-none flex items-center justify-center group relative overflow-hidden">
                <span className="text-secondary text-sm">STYLING {item}</span>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* FANTASY COLLECTION */}
        <div className="bg-white py-16 md:py-24 px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            {/* Video Play Button */}
            <div className="flex justify-center mb-8">
              <button className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition">
                <Play size={32} fill="currentColor" />
              </button>
            </div>
            
            {/* Text Content */}
            <div className="text-center">
              <h2 className="text-heading-lg uppercase mb-6">FANTASY COLLECTION.</h2>
              <p className="text-sm md:text-base text-black mb-8 leading-relaxed">
                Fantasy Collection is where imagination meets comfort. Celebrating softness, playfulness, and boundless creativity, the collection brings Hello Kitty&apos;s iconic charm into Levents&apos; fantastical universe. Each piece blends everyday comfort with a subtle touch of gentle, expressive, and effortlessly wearable. Designed for dreamers, this collection encourages us to embrace joy, trust ourselves, and follow our dreams, every single day
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <button className="btn-primary">XEM THÊM</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
