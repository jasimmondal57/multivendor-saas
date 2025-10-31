'use client';

import DynamicPage from '@/components/page-builder/DynamicPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomepagePreview() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
        <p className="text-sm font-medium text-yellow-800">
          📋 Preview Mode - This is how the Page Builder homepage will look
        </p>
      </div>
      <Header />
      <DynamicPage slug="homepage" isHomepage={true} />
      <Footer />
    </div>
  );
}

