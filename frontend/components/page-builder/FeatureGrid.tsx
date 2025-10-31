'use client';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeatureGridProps {
  settings: {
    title?: string;
    features: Feature[];
    columns?: number;
    icon_style?: string;
  };
}

const iconMap: Record<string, string> = {
  truck: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  'shield-check': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  headphones: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
};

export default function FeatureGrid({ settings }: FeatureGridProps) {
  const columns = settings.columns || 4;
  const gridClass = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-8`;

  return (
    <div className="py-12">
      {settings.title && (
        <h2 className="text-3xl font-bold text-center mb-12">{settings.title}</h2>
      )}

      <div className={gridClass}>
        {settings.features.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconMap[feature.icon] || iconMap.truck} />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

