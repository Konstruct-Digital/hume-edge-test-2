# Editable content markers

This site supports the Konstruct Content Agent Portal's inline visual
editor. That feature needs a way to tell "this rendered DOM node
corresponds to this exact field in this exact content JSON file" — this
document is that contract. See `BRAND.md`'s Approved Components table for
the *shape* of content; this document is about *marking* it for direct
visual editing.

## Leaf fields (a single editable string or href)

Use the `<Editable>` component (`src/components/Editable.astro`) for any
value rendered as a plain passthrough of a content field:

```astro
<Editable as="h1" value={section.heading} file={file} path={`sections.${i}.heading`} />
```

For a link whose destination is also content-backed:

```astro
<Editable as="a" value={section.ctaLabel} file={file} path={`sections.${i}.ctaLabel`}
	hrefPath={`sections.${i}.ctaHref`} hrefValue={section.ctaHref} href={section.ctaHref} />
```

If the destination is hardcoded in the component (not a content field),
omit `hrefPath`/`hrefValue` — only the label stays editable.

### When `<Editable>` doesn't fit

Anywhere the field's rendered presentation isn't a pure passthrough of the
value (decorated wrappers, conditional branches, `set:html` blocks that
already exist for other reasons) — hand-place the same attributes directly
on the real element instead:

- `data-k-file` (required) — full repo-relative path, e.g. `src/content/pages/home.json`.
- `data-k-path` (required) — dot-delimited path into that file's parsed JSON; numeric segments are array indices (`sections.0.heading`).
- `data-k-value` (required) — the exact literal current string value. **Never** rely on the injected script reading rendered `textContent` back out — if the render decorates or transforms the value (curly quotes, wrapping markup), the visible text is not the raw field value, and `data-k-value` is the only source of truth.
- `data-k-kind` (required) — `text` or `html`.
- `data-k-label` (optional) — human-readable name for the popover/review list.
- `data-k-href-path` / `data-k-href-value` (optional) — same rules as above, for a link's destination.

### Firm rule

A path must only ever target a leaf content string, never a schema
discriminator (`type`) or any structural/shape field.

## Modules (a whole section, or something nested inside one)

For anything a developer wants to make referenceable as a whole — a
section, or something nested inside one, like a single FAQ item or one team
member's card — add:

- `data-k-module-file` (required) — same file-path rule as above.
- `data-k-module-path` (required) — path to the *object*, not a leaf string (`sections.3`, or `sections.3.items.1` for one FAQ entry).
- `data-k-module-label` (optional) — human-readable name for the reference chip.

These nest arbitrarily — a developer can mark both the whole section and
each item inside it as their own module; the injected script always picks
the innermost module ancestor of wherever the client clicked.

## Variable-kind fields (the default shape for a text field)

A field's `kind` (`text` or `html`) is normally fixed once, in the
component's own source, and applies to every instance that render line
produces. Rather than deciding case by case whether a given field might
someday want rich formatting, use the `{ text, kind }` object shape by
default for every `kind:'text'` leaf field, so the Portal's "Add styling"
action (see the Portal's own docs) is available everywhere a text field is
editable, with no per-field judgment call and no later retrofit:

```json
{ "text": "Best decision we made all year.", "kind": "text" }
```

instead of a bare string like `"Best decision we made all year."`.

Add this helper once near the top of `content.config.ts` and reuse it for
every text field's Zod type:

```ts
import { z } from 'astro:content'; // or 'astro/zod', matching this site's existing import

const variableKindText = z.union([
  z.string(),
  z.object({ text: z.string(), kind: z.enum(['text', 'html']) }),
]);
```

then declare a field with `eyebrow: variableKindText` instead of
`eyebrow: z.string()`. `<Editable>` detects the shape automatically at
render time — no extra prop needed, and no branching in the component:

```astro
<Editable as="p" value={testimonial.quote} file={file} path={`${modulePath}.quote`} />
```

works identically whether `testimonial.quote` is a plain string or a
`{ text, kind }` object. When it's the object shape, `Editable` reports the
leaf's content path as `<path>.text` and adds a
`data-k-kind-path="<path>.kind"` attribute — a real path into this same
content file, editable through the exact same mechanism as any other field
(the "Add styling" action is just an ordinary edit setting that path's
value to `"html"`, nothing new on the write side).

**When a bare string is still right:** only for a value that was never
going to be rendered as user-facing prose in the first place — a schema
discriminator (`type`), a structural field, an href, an icon name, a color
token, a numeric id. Anything a client would ever read as text on the page
gets the object shape by default. This removes the earlier "is this
field prose-shaped enough" judgment call entirely — the object shape is
the default, a bare string is the deliberate exception, not the other way
around.

**Reading a field outside `<Editable>`.** `<Editable>` unwraps either shape
itself. Anywhere else a field is read as a string (an `alt` or `aria-label`, a
`data-*` attribute, a `<title>`, JSON-LD, `.join()`), an object value prints as
`[object Object]`. Unwrap it first with a one-line helper, `src/lib/plain.ts`:

```ts
export type VariableKindText = string | { text: string; kind: 'text' | 'html' };

export function plain(value: VariableKindText): string {
  return typeof value === 'object' && value !== null ? value.text : value;
}
```

then `alt={plain(member.name)}`. `astro check` flags the typed cases (an `alt`
expecting a string), but values passed into arbitrary attributes are not
type-checked, so after migrating any field also grep the built HTML for
`[object Object]`.

**Text with decoration around it** (quote marks, a nested element, an `id` a
script depends on): put an inner `<Editable as="span">` inside the decoration
(`<p>"<Editable as="span" ... />"</p>`) instead of hand-placing attributes on the
outer element. A hand-placed attribute set on a variable-kind field has to point
at `<path>.text`, add `data-k-kind-path`, and render with `set:html` when the
kind is `html`, which is exactly what `<Editable>` already does for you.

**Retrofitting an existing field later** (a site already built and already
live) is a normal, bounded change, not something that has to be decided up
front:

1. Migrate the content data for that field from a bare string to
   `{ text, kind }` (one-time, for every existing record).
2. Update the Zod schema in `content.config.ts` to match.
3. Update any other place the component reads that field directly (outside
   the `<Editable>` call itself) to unwrap it with `plain()` (see above)
   instead of reading the bare value.

Hand-placed raw attributes (where `<Editable>` doesn't fit) can use this
pattern too — just point `data-k-path` at `<path>.text` and add
`data-k-kind-path="<path>.kind"` directly, following the same shape.

## Keeping new content editable (for future development)

This contract isn't a one-time retrofit — it has to keep being applied as
this site grows. Whenever a new content-bearing component or section gets
added here (a new section type, a new field, a new page), whoever builds it
should also mark it per this contract, in the same commit:

1. Does the new component render a value straight from a `src/content/**`
   file? If it's a pure passthrough, wrap it in `<Editable>`, and give the
   new field the `{ text, kind }` shape in its schema (per the Variable-kind
   fields section above) rather than a bare string — that's the default now,
   not a follow-up decision. If the render isn't a pure passthrough (a
   wrapper, a conditional, a `set:html` block), hand-place the `data-k-*`
   attributes directly, per the Leaf fields section above.
2. Does the new component represent a whole section or a repeatable item
   worth referencing as a unit (a new card type, a new list item)? Add
   `data-k-module-*` on its container, per the Modules section above.
3. Run a build and confirm nothing broke.

There's no separate spec for this — it's the same two sections above,
applied incrementally instead of all at once. If this file or the injected
script (`kc-inline-edit.js`) ever needs to change to support something new,
treat that as a real design decision, not a drive-by edit — the contract is
shared with the Portal's own code, and a change here without a matching
change there breaks silently.

## Testing against a non-production Portal

`kc-inline-edit.js`'s `PORTAL_ORIGIN` constant is hardcoded to the real production Portal domain. To test this site's inline-editing behavior against a different Portal deployment (e.g. a `-dev` preview Worker), open a browser tab pointed **directly at this site** (not the Portal) and run, in that tab's own console:

```js
localStorage.setItem('kc-portal-origin-override', 'https://your-dev-portal-origin.example');
```

This must be set on the site's own origin, not the Portal's — the injected script executes inside the iframe, so it only ever reads its own origin's localStorage. Setting this key on the Portal's origin has no effect. Clear it (`localStorage.removeItem('kc-portal-origin-override')`) when done testing, so the site falls back to trusting only the real production Portal again.
