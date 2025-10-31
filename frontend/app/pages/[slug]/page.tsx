'use client';

import { useParams } from 'next/navigation';
import DynamicPage from '@/components/page-builder/DynamicPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DynamicPageRoute() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DynamicPage slug={slug} />
      <Footer />
    </div>
  );
}

