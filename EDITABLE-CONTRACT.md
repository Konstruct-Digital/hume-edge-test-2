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

## Variable-kind fields (optional)

A field's `kind` (`text` or `html`) is normally fixed once, in the
component's own source, and applies to every instance that render line
produces — that's the right default for almost every field. For a field
where the client might reasonably want to switch between plain text and
rich formatting later, without a developer editing component code, store
its value as an object instead of a bare string:

```json
{ "text": "Best decision we made all year.", "kind": "text" }
```

instead of:

```json
"Best decision we made all year."
```

`<Editable>` detects this shape automatically — no extra prop needed:

```astro
<Editable as="p" value={testimonial.quote} file={file} path={`${modulePath}.quote`} />
```

works identically whether `testimonial.quote` is a plain string or a
`{ text, kind }` object. When it's the object shape, `Editable` reports the
leaf's content path as `<path>.text` and adds a
`data-k-kind-path="<path>.kind"` attribute — a real path into this same
content file, editable through the exact same mechanism as any other field
(a future "convert to rich text" action is just an ordinary edit setting
that path's value to `"html"`, nothing new on the write side).

**When to use this vs. a plain string:** a bare string is right for
anything that's always going to be plain — headings, nav labels, names.
Reach for the `{ text, kind }` shape for prose-shaped fields where
formatting flexibility is plausible later — body copy, quotes,
descriptions. This is a schema decision made once, the same moment you're
already deciding a field's shape (string vs. array vs. nested object) — not
a new category of Portal-specific rule.

**Retrofitting an existing field later** (a site already built and already
live) is a normal, bounded change, not something that has to be decided up
front:

1. Migrate the content data for that field from a bare string to
   `{ text, kind }` (one-time, for every existing record).
2. Update the Zod schema in `content.config.ts` to match.
3. Update any other place the component reads that field directly (outside
   the `<Editable>` call itself) to use `.text` instead of the bare value.

Hand-placed raw attributes (where `<Editable>` doesn't fit) can use this
pattern too — just point `data-k-path` at `<path>.text` and add
`data-k-kind-path="<path>.kind"` directly, following the same shape.

## Keeping new content editable (for future development)

This contract isn't a one-time retrofit — it has to keep being applied as
this site grows. Whenever a new content-bearing component or section gets
added here (a new section type, a new field, a new page), whoever builds it
should also mark it per this contract, in the same commit:

1. Does the new component render a value straight from a `src/content/**`
   file? If it's a pure passthrough, wrap it in `<Editable>`. If the render
   isn't a pure passthrough (a wrapper, a conditional, a `set:html` block),
   hand-place the `data-k-*` attributes directly, per the Leaf fields
   section above.
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
