/** Central place for brand, SEO defaults and navigation. */
export const SITE = {
  name: 'विद्या',
  tagline: 'जगातलं उत्तम ज्ञान — तुमच्या भाषेत.',
  // Used in <title> separators, footer, structured data.
  nameEn: 'Vidya',
  description:
    'विद्या — महत्त्वाकांक्षी, जिज्ञासू मराठी वाचकांसाठी व्यवसाय, तंत्रज्ञान, स्टार्टअप, कौशल्ये आणि उद्योजकतेवरचं विश्वासार्ह, सखोल आणि उपयुक्त लेखन.',
  // Default Open Graph / Twitter image (1200×630) lives in /public.
  defaultOgImage: '/og-default.png',
  locale: 'mr_IN',
  twitter: '@vidyamarathi',
  email: 'sampadak@vidya.example.com',
} as const;

export const NAV = [
  { label: 'व्यवसाय', href: '/category/business' },
  { label: 'तंत्रज्ञान', href: '/category/technology' },
  { label: 'स्टार्टअप', href: '/category/startups' },
  { label: 'कौशल्ये', href: '/category/learning' },
  { label: 'उद्योजकता', href: '/category/entrepreneurship' },
  { label: 'करिअर', href: '/category/education' },
  { label: 'क्रीडा', href: '/category/sports' },
] as const;
