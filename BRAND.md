# BRAND.md — Hume Edge

This file is read verbatim into the content agent's system prompt every session. Keep it short and unambiguous.

## Voice & Tone

[FILL IN — ask the client]

## Visual Identity

Reference only — do not edit these values as content; they live in `src/styles/tokens.css`.

- **Primary palette:** Indigo `#150352`, Purple `#7118C2`, Magenta `#BC10DE`, Blue `#0599FF`, Mint `#00FB90`
- **Display font:** Poppins
- **Body font:** Inter
- **Brand gradient:** `linear-gradient(135deg, #150352 0%, #7118C2 45%, #BC10DE 80%, #00FB90 110%)`

## Approved Components

Generated from `src/content.config.ts`. Each row is a section/collection the agent may edit content for — field names must match the real Zod schema.

| Collection | Entry | Purpose | Key fields |
|---|---|---|---|
| `pages` | `home` | Home page — hero, problem/solution narrative, services, comparison, industries, testimonials, why-us, leadership, closing CTA | `meta`, `orgSchema`, `hero`, `intro`, `problems`, `imageBreak`, `services`, `versus`, `industries`, `testimonials`, `whyDifferent`, `leadership`, `cta` |
| `pages` | `about` | About page — hero, short pitch, mission/convictions, founder bios, origin story, closing CTA | `meta`, `hero`, `shortVersion`, `mission`, `team`, `story`, `cta` |
| `pages` | `contact` | Contact page — hero, what-to-expect list, direct-contact links | `meta`, `hero`, `expect`, `expectHeading`, `directContacts`, `directHeading` |
| `pages` | `not-found` | 404 error page | `meta`, `code`, `heading`, `body`, `ctaLabel`, `ctaHref` |
| `site` | `global` | Shared nav and footer, present on every page | `nav`, `footer` |

Fields whose name ends in `Html` (e.g. `titleHtml`, `headingHtml`) hold raw HTML and may contain inline tags like `<em>`, `<br>`, `<a>`, `<strong>` — preserve or produce valid, balanced markup in those fields. Most other text fields are stored as an object, `{ "text": "...", "kind": "text" | "html" }`, instead of a bare string. Edit only the `text` value and leave `kind` exactly as it is: never replace the object with a plain string, and never change `kind` yourself (a client switches it with the Portal's "Add styling" action). When `kind` is `"text"`, `text` is plain and escaped automatically, so do not put HTML tags in it. When `kind` is `"html"`, `text` is HTML: keep its existing tags and links intact unless the client asked you to change them. A field that is still a bare string (and not named `*Html`) is plain text; do not put HTML tags in it.

## Editable content markers

Every content-bearing field on this site is marked for the Portal's inline visual editor per `EDITABLE-CONTRACT.md` at the repo root — read that file for the full `data-k-*` markup contract before adding any new content-bearing component.

## Site Structure

- `/` — Home
- `/about` — About
- `/contact` — Contact
- 404 fallback (not a navigable route)

## Content Rules

[FILL IN]

## Deploy Timing

Changes typically go live within a couple of minutes of being saved.

## Out of Scope

The agent may not edit these paths — they are layout, component, and build configuration, not content:

- `src/layouts/**`
- `src/components/**`
- `src/pages/**`
- `src/content.config.ts`
- `astro.config.mjs`
- `package.json`, `package-lock.json`, `tsconfig.json`
- `.github/**`
- `.konstruct/**`
