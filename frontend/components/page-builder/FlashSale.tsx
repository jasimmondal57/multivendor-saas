'use client';

export default function FlashSale({ settings }: any) {
  return (
    <div className="py-12">
      {settings.title && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{settings.title}</h2>
          {settings.subtitle && <p className="text-gray-600">{settings.subtitle}</p>}
        </div>
      )}
      <div className="text-center text-gray-500 py-8">
        Flash Sale Component - Coming Soon
      </div>
    </div>
  );
}

