// Injected into every page of this site via a <script type="module"> tag
// in the shared layout, so the Konstruct Content Agent Portal can offer
// inline visual editing. This script is a pure, trust-free "reporter" — it
// never performs any privileged write itself. It only ever reports
// hover/click intent up to its own parent frame via postMessage; the
// Portal's own authenticated session is what actually authorizes any
// write. See EDITABLE-CONTRACT.md for the markup contract this reads.

// Falls back to a localStorage override for local/dev testing against a
// non-production Portal deployment (e.g. konstruct-content-agent-portal-dev)
// without needing a second copy of this file — production sites never set
// this key, so the hardcoded origin below is what actually ships.
export const PORTAL_ORIGIN =
	(typeof localStorage !== 'undefined' && localStorage.getItem('kc-portal-origin-override')) ||
	'https://web-portal.konstructdigital.com';

export function isValidPortalMessage(data, eventOrigin) {
	if (eventOrigin !== PORTAL_ORIGIN) return false;
	if (!data || typeof data !== 'object') return false;
	if (data.source !== 'konstruct-portal') return false;
	return ['activate', 'deactivate', 'apply-preview'].includes(data.type);
}

// Finds the innermost leaf (data-k-path/data-k-href-path) and module
// (data-k-module-path) ancestor-or-self of `element`, independently — a
// module can contain a leaf, and hovering the leaf should report both so
// the caller can decide which affordance (pencil vs. reference icon)
// applies, per the "leaf always wins over module" rule.
export function findEditableTargets(element) {
	const leaf = element.closest('[data-k-path], [data-k-href-path]');
	const module = element.closest('[data-k-module-path]');
	return { leaf, module };
}

export function readLeafData(el) {
	if (!el) return null;
	return {
		file: el.getAttribute('data-k-file'),
		path: el.getAttribute('data-k-path') || null,
		value: el.getAttribute('data-k-value') || null,
		kind: el.getAttribute('data-k-kind') || 'text',
		label: el.getAttribute('data-k-label') || null,
		hrefPath: el.getAttribute('data-k-href-path') || null,
		hrefValue: el.getAttribute('data-k-href-value') || null,
	};
}

// Aggregates every descendant leaf's data inside a module's subtree — the
// "current content snapshot" a reference chip shows, built entirely from
// attributes already present for the leaf-editing feature, no extra data
// embedding needed anywhere.
export function readModuleSnapshot(moduleEl) {
	const fields = [];
	moduleEl.querySelectorAll('[data-k-path]').forEach((leafEl) => {
		fields.push({
			path: leafEl.getAttribute('data-k-path'),
			value: leafEl.getAttribute('data-k-value'),
			label: leafEl.getAttribute('data-k-label') || null,
		});
	});
	return {
		file: moduleEl.getAttribute('data-k-module-file'),
		path: moduleEl.getAttribute('data-k-module-path'),
		label: moduleEl.getAttribute('data-k-module-label') || null,
		fields,
	};
}

let active = false;
let overlayShadow = null;
let overlayHost = null;
let hoverBox = null;
let pencilBadge = null;
let moduleBadge = null;
let currentLeaf = null;
let currentModule = null;

function reportToParent(message) {
	if (window.parent === window) return;
	window.parent.postMessage({ source: 'konstruct-site', ...message }, PORTAL_ORIGIN);
}

// A single Shadow DOM root, attached once, so neither the host site's CSS
// (however aggressive) can reach in, nor the overlay's own styling can leak
// out. A sibling overlay, never an inserted wrapper, so it can't disturb
// the page's own box model or selectors.
function ensureOverlay() {
	if (overlayShadow) return overlayShadow;
	const host = document.createElement('div');
	host.style.cssText = 'position:fixed; top:0; left:0; width:0; height:0; z-index:2147483647;';
	overlayHost = host;
	document.body.appendChild(host);
	overlayShadow = host.attachShadow({ mode: 'open' });
	overlayShadow.innerHTML = `
		<style>
			.box { position: fixed; border: 2px solid #1283E7; border-radius: 4px; pointer-events: none; display: none; }
			.badge { position: fixed; background: #1283E7; color: #fff; width: 22px; height: 22px; border-radius: 50%;
				display: none; align-items: center; justify-content: center; cursor: pointer; font-size: 13px;
				font-family: sans-serif; pointer-events: auto; border: none; }
			.badge.module { background: #FE8B4A; }
		</style>
		<div class="box" id="box"></div>
		<button type="button" class="badge" id="pencil" aria-label="Edit this field">&#9998;</button>
		<button type="button" class="badge module" id="module-badge" aria-label="Reference this section">&#128279;</button>
	`;
	hoverBox = overlayShadow.getElementById('box');
	pencilBadge = overlayShadow.getElementById('pencil');
	moduleBadge = overlayShadow.getElementById('module-badge');

	pencilBadge.addEventListener('click', (e) => {
		e.stopPropagation();
		if (!currentLeaf) return;
		const data = readLeafData(currentLeaf);
		const rect = currentLeaf.getBoundingClientRect();
		reportToParent({ type: 'edit-click', payload: { ...data, rect: rectToPlain(rect) } });
	});
	moduleBadge.addEventListener('click', (e) => {
		e.stopPropagation();
		if (!currentModule) return;
		const snapshot = readModuleSnapshot(currentModule);
		const rect = currentModule.getBoundingClientRect();
		reportToParent({ type: 'module-click', payload: { ...snapshot, rect: rectToPlain(rect) } });
	});
	return overlayShadow;
}

function rectToPlain(rect) {
	return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

function positionOverlay(el, isModule) {
	const rect = el.getBoundingClientRect();
	hoverBox.style.display = 'block';
	hoverBox.style.top = rect.top + 'px';
	hoverBox.style.left = rect.left + 'px';
	hoverBox.style.width = rect.width + 'px';
	hoverBox.style.height = rect.height + 'px';
	const badge = isModule ? moduleBadge : pencilBadge;
	const other = isModule ? pencilBadge : moduleBadge;
	other.style.display = 'none';
	badge.style.display = 'flex';
	badge.style.top = Math.max(0, rect.top - 11) + 'px';
	badge.style.left = Math.max(0, rect.left + rect.width - 11) + 'px';
}

function hideOverlay() {
	if (!hoverBox) return;
	hoverBox.style.display = 'none';
	pencilBadge.style.display = 'none';
	moduleBadge.style.display = 'none';
	currentLeaf = null;
	currentModule = null;
}

// Leaf always wins when the cursor is directly over one, even if it's
// nested inside a module — the module affordance only shows when hovering
// a part of the module that isn't itself a leaf.
function onPointerMove(e) {
	if (!active) return;
	const target = document.elementFromPoint(e.clientX, e.clientY);
	if (!target) return;
	if (target === overlayHost) return;
	const { leaf, module } = findEditableTargets(target);
	if (leaf) {
		currentLeaf = leaf;
		currentModule = module;
		positionOverlay(leaf, false);
	} else if (module) {
		currentLeaf = null;
		currentModule = module;
		positionOverlay(module, true);
	} else {
		hideOverlay();
	}
}

function activate() {
	if (active) return;
	active = true;
	ensureOverlay();
	document.addEventListener('pointermove', onPointerMove);
	reportToParent({ type: 'activated', count: document.querySelectorAll('[data-k-path],[data-k-module-path]').length });
}

function deactivate() {
	active = false;
	document.removeEventListener('pointermove', onPointerMove);
	hideOverlay();
}

// kind:'html' fields never get a live cosmetic patch, even though the
// original render may use set:html for other reasons — only textContent/
// attribute assignment, never markup injection. This is the one hard
// safety rule from the spec: it closes off the one path a spoofed message
// could otherwise use to inject markup into the page.
export function applyPreview({ file, path, hrefPath, value }) {
	if (path) {
		document.querySelectorAll('[data-k-path]').forEach((el) => {
			if (el.getAttribute('data-k-file') === file && el.getAttribute('data-k-path') === path) {
				if (el.getAttribute('data-k-kind') !== 'html') el.textContent = value;
			}
		});
	}
	if (hrefPath) {
		document.querySelectorAll('[data-k-href-path]').forEach((el) => {
			if (el.getAttribute('data-k-file') === file && el.getAttribute('data-k-href-path') === hrefPath) {
				el.setAttribute('href', value);
			}
		});
	}
}

// Only ever wired up when actually embedded (window.self !== window.top) —
// a normal top-level visit never even attaches a listener, so there's
// nothing for a spoofed message to trigger regardless of origin checks.
if (typeof window !== 'undefined' && window.self !== window.top) {
	window.addEventListener('message', (event) => {
		if (!isValidPortalMessage(event.data, event.origin)) {
			if (event.data && typeof event.data === 'object' && event.data.source === 'konstruct-portal') {
				console.warn(
					'[kc-inline-edit] Rejected a message claiming to be from the Portal — origin mismatch (expected ' +
						PORTAL_ORIGIN +
						', got ' +
						event.origin +
						'). If you are testing against a non-production Portal deployment, set localStorage.setItem("kc-portal-origin-override", "<that Portal\'s real origin>") in a tab open directly on THIS site (not the Portal) — the override only works set on this site\'s own origin, since this script runs inside the iframe.',
				);
			}
			return;
		}
		if (event.data.type === 'activate') activate();
		if (event.data.type === 'deactivate') deactivate();
		if (event.data.type === 'apply-preview') applyPreview(event.data);
	});
	window.addEventListener('DOMContentLoaded', () => {
		reportToParent({ type: 'ready' });
	});
}
