// src/lib/seo.ts
// SEO helpers — JSON-LD builders + page meta.
// All schema.org structured data lives here.

import type { Locale } from './i18n';

const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://reesetan.com';
const SITE_NAME = 'Reese Tan';
const SITE_DESCRIPTION_EN = 'Reese Tan is a HRDC-accredited AI Trainer and full-time Digital Marketing Strategist. Helping SME owners and corporate teams replace manual tasks with AI — so they can do more in less time. HRD Corp Claimable. LPPEH 5 CPD Hours. Based in Malaysia.';
const SITE_DESCRIPTION_ZH = 'Reese Tan 是获得 HRDC 认证的 AI 培训师,也是全职数字营销策略顾问。帮助中小企业主和企业团队用 AI 替代重复工作——花更少时间,做更多事。马来西亚 HRD Corp 可报销,LPPEH 5 CPD 学时。';

export function getSiteUrl(): string {
  return SITE_URL;
}

export function getOgImage(): string {
  return `${SITE_URL}/og-image.jpg`;
}

/** Build a full <head> meta block for a page. */
export function pageMeta(opts: {
  title: string;
  description: string;
  locale: Locale;
  path: string;
  ogImage?: string;
  type?: 'website' | 'article';
}) {
  const { title, description, locale, path, ogImage, type = 'website' } = opts;
  const url = `${SITE_URL}${path}`;
  const image = ogImage || getOgImage();
  const ogLocale = locale === 'zh' ? 'zh_CN' : 'en_MY';

  return {
    title,
    description,
    canonical: url,
    openGraph: {
      type,
      url,
      title,
      description,
      image,
      siteName: SITE_NAME,
      locale: ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image,
    },
    alternates: {
      languages: {
        en: `${SITE_URL}${path.replace(/^\/zh/, '')}`,
        'zh-Hans': `${SITE_URL}/zh${path.replace(/^\/zh/, '')}`,
      },
    },
  };
}

// ===========================================================================
// JSON-LD BUILDERS
// ===========================================================================

/** Person + Organization + WebSite + LocalBusiness — site-wide. */
export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}#reesetan`,
        name: 'Reese Tan',
        jobTitle: 'AI Trainer & Digital Marketing Strategist',
        description: SITE_DESCRIPTION_EN,
        url: SITE_URL,
        image: getOgImage(),
        sameAs: [
          'https://www.linkedin.com/in/reesetan/',
          'https://www.facebook.com/HartamasAcademy',
        ],
        telephone: '+60163356790',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Petaling Jaya',
          addressRegion: 'Selangor',
          addressCountry: 'MY',
        },
        knowsAbout: [
          'AI Tools Training',
          'Digital Marketing',
          'SME Training Malaysia',
          'Corporate AI Workshop',
          'Content Strategy',
          'Gemini AI',
          'Canva AI',
          'NotebookLM',
        ],
        hasCredential: [
          {
            '@type': 'EducationalOccupationalCredential',
            name: 'HRDC Accredited Trainer',
            credentialCategory: 'Professional Certification',
            recognizedBy: { '@type': 'Organization', name: 'HRD Corp Malaysia' },
          },
          {
            '@type': 'EducationalOccupationalCredential',
            name: 'LPPEH Approved Trainer — 5 CPD Hours',
            credentialCategory: 'Professional Certification',
            recognizedBy: { '@type': 'Organization', name: 'LPPEH Malaysia' },
          },
        ],
      },
      {
        '@type': ['EducationalOrganization', 'LocalBusiness'],
        '@id': `${SITE_URL}#training-business`,
        name: 'Reese Tan AI Training',
        description: SITE_DESCRIPTION_EN,
        url: SITE_URL,
        telephone: '+60163356790',
        image: getOgImage(),
        priceRange: 'RM338 – RM2,500',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Level 13, Block A, Menara Prima, Jalan PJU 1/37, Dataran Prima',
          addressLocality: 'Petaling Jaya',
          addressRegion: 'Selangor',
          postalCode: '47301',
          addressCountry: 'MY',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 3.1074, longitude: 101.6065 },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
        founder: { '@id': `${SITE_URL}#reesetan` },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: 'Reese Tan — AI Trainer & Digital Marketing Strategist Malaysia',
        description: SITE_DESCRIPTION_EN,
        inLanguage: ['en-MY', 'zh-Hans'],
        publisher: { '@id': `${SITE_URL}#reesetan` },
      },
    ],
  };
}

/** Course schema — for the Mastering AI flagship. */
export function courseSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${SITE_URL}#mastering-ai-course`,
    name: 'Mastering AI: Smart Prompts, Sharp Writing, Solid Research',
    alternateName: 'Mastering AI Smart Prompts — For Property Practitioners',
    description: 'A 5-hour hands-on AI tools training programme for SME owners, corporate teams, and property professionals. Covers Gemini, NotebookLM, Canva AI, and AI Agents. LPPEH approved for 5 CPD Hours. HRD Corp Claimable. No IT background required.',
    url: `${SITE_URL}/training`,
    image: getOgImage(),
    provider: { '@id': `${SITE_URL}#reesetan` },
    educationalCredentialAwarded: 'LPPEH 5 CPD Hours Certificate',
    timeRequired: 'PT5H',
    inLanguage: ['en', 'zh'],
    coursePrerequisites: 'No technical background required. Bring a laptop or smartphone.',
    teaches: [
      'AI Prompting using the RTOF formula',
      'Writing with AI tools',
      'Market research with Gemini and NotebookLM',
      'Creating visuals with Canva AI',
      'Building AI assistants with AI Agents',
    ],
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'onsite',
      location: {
        '@type': 'Place',
        name: 'Hartamas Training Centre, Petaling Jaya',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Level 13, Block A, Menara Prima',
          addressLocality: 'Petaling Jaya',
          addressRegion: 'Selangor',
          addressCountry: 'MY',
        },
      },
      offers: {
        '@type': 'Offer',
        price: '338',
        priceCurrency: 'MYR',
        availability: 'https://schema.org/InStock',
      },
    },
  };
}

/** FAQPage schema — for the 10 questions. */
export function faqSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#faq-section', '#about-section', '#training-section'],
    },
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** VideoObject schema — for the AI chatbot demo. */
export function videoSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'AI Tools for Property Professionals — Live Demo',
    description: 'A live demonstration of AI tools in action — exactly what you\'ll learn to build in the training.',
    thumbnailUrl: `${SITE_URL}/images/aichatbot-demo-poster.jpg`,
    contentUrl: `${SITE_URL}/videos/aichatbot-demo.mp4`,
    embedUrl: 'https://www.youtube.com/shorts/F_xJ25AFyCM',
    uploadDate: '2026-01-15',
    duration: 'PT1M30S',
    inLanguage: 'en',
  };
}

/** BreadcrumbList schema. */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
