'use client';

import dynamic from 'next/dynamic';

// Dynamically import components
const HeroBanner = dynamic(() => import('./HeroBanner'));
const CategoryGrid = dynamic(() => import('./CategoryGrid'));
const ProductCarousel = dynamic(() => import('./ProductCarousel'));
const FlashSale = dynamic(() => import('./FlashSale'));
const FeatureGrid = dynamic(() => import('./FeatureGrid'));
const TextBlock = dynamic(() => import('./TextBlock'));
const ImageBanner = dynamic(() => import('./ImageBanner'));

interface PageSection {
  id: number;
  component_type: string;
  component_name?: string;
  container_width?: string;
  background_color?: string;
  background_image?: string;
  padding_top?: number;
  padding_bottom?: number;
  settings: any;
  status: string;
}

interface DynamicSectionProps {
  section: PageSection;
}

const componentMap: Record<string, any> = {
  hero_banner: HeroBanner,
  category_grid: CategoryGrid,
  product_carousel: ProductCarousel,
  flash_sale: FlashSale,
  feature_grid: FeatureGrid,
  text_block: TextBlock,
  image_banner: ImageBanner,
};

export default function DynamicSection({ section }: DynamicSectionProps) {
  const Component = componentMap[section.component_type];

  if (!Component) {
    console.warn(`Component type "${section.component_type}" not found`);
    return null;
  }

  const containerClass = section.container_width === 'full' ? 'w-full' : 'container mx-auto px-4';
  
  const sectionStyle: React.CSSProperties = {
    backgroundColor: section.background_color || undefined,
    backgroundImage: section.background_image ? `url(${section.background_image})` : undefined,
    paddingTop: section.padding_top ? `${section.padding_top}px` : undefined,
    paddingBottom: section.padding_bottom ? `${section.padding_bottom}px` : undefined,
  };

  return (
    <section style={sectionStyle} className="relative">
      <div className={containerClass}>
        <Component settings={section.settings} />
      </div>
    </section>
  );
}

