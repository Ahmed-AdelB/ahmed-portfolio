import React, { useEffect, useState } from 'react';

interface IslamicDateDisplayProps {
  lang?: 'en' | 'ar';
  className?: string;
}

export const IslamicDateDisplay: React.FC<IslamicDateDisplayProps> = ({ lang = 'en', className = '' }) => {
  const [dateStr, setDateStr] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
       // Check if enabled in settings or by default (let's show it by default for now or stick to the toggle logic)
       // The previous implementation used a localStorage toggle.
       // I'll default to visible for this feature rollout, or check the store.
       // The spec says "client-load only".
       // Let's use the store if possible, or just always show if the component is mounted.
       // I'll make it always show if mounted, controlling mounting from parent or just always showing it.
       setIsVisible(true);
    };

    const locale = lang === 'ar' ? 'ar-SA-u-ca-islamic' : 'en-IE-u-ca-islamic';
    try {
      const formatted = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
      setDateStr(formatted);
      checkVisibility();
    } catch (e) {
      console.error('Hijri date formatting failed:', e);
    }
  }, [lang]);

  if (!isVisible || !dateStr) return null;

  return (
    <span className={`font-mono text-sm text-zinc-500 ${className}`} title="Hijri Date">
      {dateStr}
    </span>
  );
};
