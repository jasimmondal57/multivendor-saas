'use client';

interface TextBlockProps {
  settings: {
    title?: string;
    content: string;
    text_align?: string;
  };
}

export default function TextBlock({ settings }: TextBlockProps) {
  const alignClass = settings.text_align === 'center' ? 'text-center' : settings.text_align === 'right' ? 'text-right' : 'text-left';

  return (
    <div className={`py-12 ${alignClass}`}>
      {settings.title && (
        <h2 className="text-3xl font-bold mb-6">{settings.title}</h2>
      )}
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: settings.content }}
      />
    </div>
  );
}

