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
       try {
         const stored = localStorage.getItem('show-hijri-date');
         setIsVisible(stored === 'true');
       } catch {
         setIsVisible(false);
       }
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

  if (!dateStr) return <span id="hijri-date-toggle" className="hidden"></span>;

  return (
    <span 
      id="hijri-date-toggle"
      className={`font-mono text-sm text-zinc-500 ${className} ${isVisible ? '' : 'hidden'}`} 
      title="Hijri Date"
    >
      {dateStr}
    </span>
  );
};
