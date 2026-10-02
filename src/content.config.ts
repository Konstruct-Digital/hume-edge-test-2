import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

// A variable-kind field (EDITABLE-CONTRACT.md) — either a plain string, or
// { text, kind } once a field has been promoted to rich text via the
// Portal's "Add styling" action. Editable.astro detects the shape
// automatically, so no component code needs to change for a field using
// this instead of z.string().
const variableKindText = z.union([z.string(), z.object({ text: z.string(), kind: z.enum(['text', 'html']) })]);

const founderSchema = z.object({
  name: variableKindText,
  title: variableKindText,
  photo: z.string(),
  linkedin: z.string(),
  firms: z.array(variableKindText),
  bio: z.array(variableKindText),
  industries: variableKindText,
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
    eyebrow: variableKindText,
    titleHtml: z.string(),
    subHtml: z.string(),
    ctaPrimary: z.object({ label: z.string(), href: z.string() }),
    ctaSecondary: z.object({ label: z.string(), href: z.string() }),
  }),
  intro: z.object({
    eyebrow: variableKindText,
    leadHtml: z.string(),
    paragraphs: z.array(z.string()),
    taglineHtml: z.string(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
  problems: z.object({
    eyebrow: variableKindText,
    headingHtml: z.string(),
    intro: variableKindText,
    items: z.array(z.object({
      num: z.string(),
      color: z.string(),
      icon: z.string(),
      quote: variableKindText,
      body: variableKindText,
    })),
  }),
  imageBreak: z.object({
    headlineHtml: z.string(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
    stats: z.array(z.object({
      value: z.string(),
      suffix: z.string(),
      text: variableKindText,
      source: variableKindText,
    })),
  }),
  services: z.object({
    eyebrow: variableKindText,
    headingHtml: z.string(),
    rightParagraphs: z.array(variableKindText),
    items: z.array(z.object({
      letter: z.string(),
      title: variableKindText,
      accent: z.string(),
      ink: z.string(),
      icon: z.string(),
      tagline: z.string(),
      blurb: variableKindText,
      intro: z.string(),
      bullets: z.array(z.string()),
    })),
    lab: z.object({
      icon: z.string(),
      label: variableKindText,
      defaultTitle: variableKindText,
      defaultBody: variableKindText,
      expandedTitle: variableKindText,
      bullets: z.array(variableKindText),
    }),
  }),
  versus: z.object({
    eyebrow: variableKindText,
    headingHtml: z.string(),
    intro: variableKindText,
    usLabel: variableKindText,
    themLabel: variableKindText,
    rows: z.array(z.tuple([z.string(), z.string(), z.string()])),
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
  industries: z.object({
    eyebrow: variableKindText,
    titleHtml: z.string(),
    body: variableKindText,
    items: z.array(z.object({ name: variableKindText, icon: z.string() })),
  }),
  testimonials: z.object({
    eyebrow: variableKindText,
    heading: variableKindText,
    video: z.object({
      photo: z.string(),
      videoSrc: z.string(),
      quote: variableKindText,
      name: variableKindText,
      role: variableKindText,
      company: variableKindText,
    }),
    flip: z.object({
      accent: z.string(),
      photo: z.string(),
      quote: variableKindText,
      name: variableKindText,
      role: variableKindText,
      company: variableKindText,
      backEyebrow: variableKindText,
      backQuote: variableKindText,
    }),
  }),
  whyDifferent: z.object({
    heading: variableKindText,
    rows: z.array(z.object({ icon: z.string(), title: variableKindText, body: variableKindText })),
    closer: z.object({
      videoSrc: z.string(),
      headingHtml: z.string(),
      body: variableKindText,
      firmsLabel: variableKindText,
      firms: z.array(variableKindText),
    }),
  }),
  leadership: z.object({
    eyebrow: variableKindText,
    heading: variableKindText,
    leaders: z.array(z.object({
      name: variableKindText,
      title: variableKindText,
      photo: z.string(),
      linkedin: z.string(),
      bio: variableKindText,
    })),
  }),
  cta: ctaCopySchema,
});

const aboutSchema = z.object({
  page: z.literal('about'),
  meta: z.object({ title: z.string(), description: z.string() }),
  hero: z.object({
    eyebrow: variableKindText,
    titleHtml: z.string(),
    sub: variableKindText,
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }),
    image: z.object({ src: z.string(), alt: z.string() }),
  }),
  shortVersion: z.object({ eyebrow: variableKindText, leadHtml: z.string() }),
  mission: z.object({
    eyebrow: variableKindText,
    headingHtml: z.string(),
    convictions: z.array(z.object({
      n: z.string(),
      color: z.string(),
      icon: z.string(),
      title: variableKindText,
      body: variableKindText,
    })),
  }),
  team: z.object({
    eyebrow: variableKindText,
    headingHtml: z.string(),
    introHtml: z.string(),
    founders: z.array(founderSchema),
  }),
  story: z.object({
    eyebrow: variableKindText,
    headingHtml: z.string(),
    quote: z.object({ text: variableKindText, citeHtml: z.string() }),
    image: z.object({ src: z.string(), alt: z.string() }),
    paragraphs: z.array(variableKindText),
    signOffHtml: z.string(),
    closingParagraphHtml: z.string(),
    signature: variableKindText,
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
  hero: z.object({ eyebrow: variableKindText, titleHtml: z.string(), introHtml: z.string() }),
  expectHeading: variableKindText,
  expect: z.array(z.object({ n: z.string(), title: variableKindText, body: variableKindText })),
  directHeading: variableKindText,
  directContacts: z.array(z.object({ label: z.string(), email: z.string() })),
});

const notFoundSchema = z.object({
  page: z.literal('not-found'),
  meta: z.object({ title: z.string(), description: z.string() }),
  code: variableKindText,
  heading: variableKindText,
  body: variableKindText,
  ctaLabel: variableKindText,
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
      tagline: variableKindText,
      nav: z.array(z.object({ label: z.string(), href: z.string() })),
      ctaLabel: z.string(),
      ctaHref: z.string(),
      legal: variableKindText,
    }),
  }),
});

export type HomeData = z.infer<typeof homeSchema>;
export type AboutData = z.infer<typeof aboutSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type NotFoundData = z.infer<typeof notFoundSchema>;

export const collections = { pages, site };
