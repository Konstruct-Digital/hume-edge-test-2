import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

const founderSchema = z.object({
  name: z.string(),
  title: z.string(),
  photo: z.string(),
  linkedin: z.string(),
  firms: z.array(z.string()),
  bio: z.array(z.string()),
  industries: z.string(),
});

const ctaCopySchema = z.object({
  eyebrow: z.string(),
  headingHtml: z.string(),
  subtitle: z.string(),
});

const homeSchema = z.object({
  page: z.literal('home'),
  meta: z.object({
    title: z.string(),
    description: z.string(),
    canonical: z.string(),
  }),
  orgSchema: z.object({
    "@context": z.string(),
    "@type": z.string(),
    name: z.string(),
    url: z.string(),
    logo: z.string(),
    description: z.string(),
    sameAs: z.array(z.string()),
  }),
  hero: z.object({
    eyebrow: z.string(),
    titleHtml: z.string(),
    subHtml: z.string(),
    ctaPrimary: z.object({ label: z.string(), href: z.string() }),
    ctaSecondary: z.object({ label: z.string(), href: z.string() }),
  }),
  intro: z.object({
    eyebrow: z.string(),
    leadHtml: z.string(),
    paragraphs: z.array(z.string()),
    taglineHtml: z.string(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
  problems: z.object({
    eyebrow: z.string(),
    headingHtml: z.string(),
    intro: z.string(),
    items: z.array(z.object({
      num: z.string(),
      color: z.string(),
      icon: z.string(),
      quote: z.string(),
      body: z.string(),
    })),
  }),
  imageBreak: z.object({
    headlineHtml: z.string(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
    stats: z.array(z.object({
      value: z.string(),
      suffix: z.string(),
      text: z.string(),
      source: z.string(),
    })),
  }),
  services: z.object({
    eyebrow: z.string(),
    headingHtml: z.string(),
    rightParagraphs: z.array(z.string()),
    items: z.array(z.object({
      letter: z.string(),
      title: z.string(),
      accent: z.string(),
      ink: z.string(),
      icon: z.string(),
      tagline: z.string(),
      blurb: z.string(),
      intro: z.string(),
      bullets: z.array(z.string()),
    })),
    lab: z.object({
      icon: z.string(),
      label: z.string(),
      defaultTitle: z.string(),
      defaultBody: z.string(),
      expandedTitle: z.string(),
      bullets: z.array(z.string()),
    }),
  }),
  versus: z.object({
    eyebrow: z.string(),
    headingHtml: z.string(),
    intro: z.string(),
    usLabel: z.string(),
    themLabel: z.string(),
    rows: z.array(z.tuple([z.string(), z.string(), z.string()])),
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
  industries: z.object({
    eyebrow: z.string(),
    titleHtml: z.string(),
    body: z.string(),
    items: z.array(z.object({ name: z.string(), icon: z.string() })),
  }),
  testimonials: z.object({
    eyebrow: z.string(),
    heading: z.string(),
    video: z.object({
      photo: z.string(),
      videoSrc: z.string(),
      quote: z.string(),
      name: z.string(),
      role: z.string(),
      company: z.string(),
    }),
    flip: z.object({
      accent: z.string(),
      photo: z.string(),
      quote: z.string(),
      name: z.string(),
      role: z.string(),
      company: z.string(),
      backEyebrow: z.string(),
      backQuote: z.string(),
    }),
  }),
  whyDifferent: z.object({
    heading: z.string(),
    rows: z.array(z.object({ icon: z.string(), title: z.string(), body: z.string() })),
    closer: z.object({
      videoSrc: z.string(),
      headingHtml: z.string(),
      body: z.string(),
      firmsLabel: z.string(),
      firms: z.array(z.string()),
    }),
  }),
  leadership: z.object({
    eyebrow: z.string(),
    heading: z.string(),
    leaders: z.array(z.object({
      name: z.string(),
      title: z.string(),
      photo: z.string(),
      linkedin: z.string(),
      bio: z.string(),
    })),
  }),
  cta: ctaCopySchema,
});

const aboutSchema = z.object({
  page: z.literal('about'),
  meta: z.object({ title: z.string(), description: z.string() }),
  hero: z.object({
    eyebrow: z.string(),
    titleHtml: z.string(),
    sub: z.string(),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }),
    image: z.object({ src: z.string(), alt: z.string() }),
  }),
  shortVersion: z.object({ eyebrow: z.string(), leadHtml: z.string() }),
  mission: z.object({
    eyebrow: z.string(),
    headingHtml: z.string(),
    convictions: z.array(z.object({
      n: z.string(),
      color: z.string(),
      icon: z.string(),
      title: z.string(),
      body: z.string(),
    })),
  }),
  team: z.object({
    eyebrow: z.string(),
    headingHtml: z.string(),
    introHtml: z.string(),
    founders: z.array(founderSchema),
  }),
  story: z.object({
    eyebrow: z.string(),
    headingHtml: z.string(),
    quote: z.object({ text: z.string(), citeHtml: z.string() }),
    image: z.object({ src: z.string(), alt: z.string() }),
    paragraphs: z.array(z.string()),
    signOffHtml: z.string(),
    closingParagraphHtml: z.string(),
    signature: z.string(),
  }),
  cta: z.object({
    id: z.string(),
    formId: z.string(),
    eyebrow: z.string(),
    headingHtml: z.string(),
    subtitle: z.string(),
  }),
});

const contactSchema = z.object({
  page: z.literal('contact'),
  meta: z.object({ title: z.string(), description: z.string() }),
  hero: z.object({ eyebrow: z.string(), titleHtml: z.string(), introHtml: z.string() }),
  expect: z.array(z.object({ n: z.string(), title: z.string(), body: z.string() })),
  directContacts: z.array(z.object({ label: z.string(), email: z.string() })),
});

const notFoundSchema = z.object({
  page: z.literal('not-found'),
  meta: z.object({ title: z.string(), description: z.string() }),
  code: z.string(),
  heading: z.string(),
  body: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages' }),
  schema: z.discriminatedUnion('page', [homeSchema, aboutSchema, contactSchema, notFoundSchema]),
});

const site = defineCollection({
  loader: file('./src/content/site/global.json'),
  schema: z.object({
    nav: z.object({
      items: z.array(z.object({ label: z.string(), href: z.string() })),
      ctaLabel: z.string(),
      ctaHref: z.string(),
    }),
    footer: z.object({
      tagline: z.string(),
      nav: z.array(z.object({ label: z.string(), href: z.string() })),
      ctaLabel: z.string(),
      ctaHref: z.string(),
      legal: z.string(),
    }),
  }),
});

export type HomeData = z.infer<typeof homeSchema>;
export type AboutData = z.infer<typeof aboutSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type NotFoundData = z.infer<typeof notFoundSchema>;

export const collections = { pages, site };
