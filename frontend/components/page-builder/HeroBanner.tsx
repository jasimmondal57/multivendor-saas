'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image_desktop?: string;
  image_mobile?: string;
  cta_text?: string;
  cta_link?: string;
  cta_style?: string;
  text_color?: string;
  text_alignment?: string;
}

interface HeroBannerProps {
  settings: {
    banner_ids?: number[];
    slider_enabled?: boolean;
    autoplay?: boolean;
    autoplay_speed?: number;
    show_arrows?: boolean;
    show_dots?: boolean;
    height?: 'small' | 'medium' | 'large';
  };
}

export default function HeroBanner({ settings }: HeroBannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (settings.slider_enabled && settings.autoplay && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, settings.autoplay_speed || 5000);

      return () => clearInterval(interval);
    }
  }, [banners, settings]);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/v1/banners?group=homepage_hero');
      const data = await response.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const heightClass = {
    small: 'h-64 md:h-80',
    medium: 'h-80 md:h-96',
    large: 'h-96 md:h-[500px]',
  }[settings.height || 'large'];

  if (loading) {
    return (
      <div className={`${heightClass} bg-gray-200 animate-pulse`}></div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div className={`relative ${heightClass}`}>
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={banner.image_desktop || '/placeholder-banner.jpg'}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              
              <div className={`absolute inset-0 flex items-center justify-${banner.text_alignment || 'center'}`}>
                <div className="container mx-auto px-4">
                  <div className={`max-w-2xl text-${banner.text_alignment || 'center'}`}>
                    {banner.subtitle && (
                      <p className="text-lg md:text-xl mb-2" style={{ color: banner.text_color || '#FFFFFF' }}>
                        {banner.subtitle}
                      </p>
                    )}
                    <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: banner.text_color || '#FFFFFF' }}>
                      {banner.title}
                    </h1>
                    {banner.description && (
                      <p className="text-lg md:text-xl mb-6" style={{ color: banner.text_color || '#FFFFFF' }}>
                        {banner.description}
                      </p>
                    )}
                    {banner.cta_text && banner.cta_link && (
                      <Link
                        href={banner.cta_link}
                        className={`inline-block px-8 py-3 rounded-lg font-semibold transition-colors ${
                          banner.cta_style === 'primary'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : banner.cta_style === 'secondary'
                            ? 'bg-white text-gray-900 hover:bg-gray-100'
                            : 'border-2 border-white text-white hover:bg-white hover:text-gray-900'
                        }`}
                      >
                        {banner.cta_text}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {settings.show_arrows && banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots */}
        {settings.show_dots && banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white bg-opacity-50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

