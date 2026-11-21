'use client';

import { Fragment, useMemo } from 'react';
import type { RichText } from '@/lib/solver/schema';

const ALLOWED_TAGS = new Set([
  'span', 'math', 'semantics', 'annotation', 'mrow', 'mi', 'mn', 'mo', 'msup', 'msub', 'msubsup', 'mfrac',
  'msqrt', 'mroot', 'mover', 'munder', 'munderover', 'mtable', 'mtr', 'mtd', 'mstyle', 'mpadded', 'mphantom',
  'menclose', 'mspace', 'ms', 'mtext', 'mmultiscripts', 'mprescripts', 'none', 'maction', 'merror', 'mglyph',
  'svg', 'path', 'g', 'defs', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'text', 'tspan',
]);

const ALLOWED_ATTRS = new Set([
  'class', 'style', 'aria-hidden', 'aria-label', 'role', 'xmlns', 'display', 'accent', 'accentunder', 'fence',
  'separator', 'stretchy', 'symmetric', 'maxsize', 'minsize', 'rowspacing', 'columnspacing', 'columnalign',
  'rowalign', 'displaystyle', 'scriptlevel', 'mathvariant', 'mathsize', 'width', 'height', 'depth', 'voffset',
  'lspace', 'rspace', 'movablelimits', 'notation', 'encoding', 'offset', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'cx', 'cy', 'r', 'rx', 'ry', 'points', 'transform', 'fill', 'stroke', 'stroke-width', 'viewBox',
  'preserveAspectRatio', 'd', 'fill-opacity', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin',
  'vector-effect', 'startOffset', 'textLength', 'lengthAdjust', 'dy', 'dx',
]);

const DANGEROUS_STYLE_RE =
  /url\s*\(|expression\s*\(|javascript\s*:|vbscript\s*:|data\s*:|@import|behavior\s*:|binding|-moz-binding|position\s*:/i;

function sanitizeStyle(value: string): string | undefined {
  if (!value || DANGEROUS_STYLE_RE.test(value)) return undefined;
  const clean = value.replace(/[\u0000-\u001F]/g, ' ').trim();
  return clean || undefined;
}

function sanitizeElement(element: Element): Element | null {
  const tag = element.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tag)) return null;

  const clone = document.createElement(tag) as Element;
  for (const attr of Array.from(element.attributes)) {
    const name = attr.name.toLowerCase();
    if (name === 'id' || (!ALLOWED_ATTRS.has(name) && !name.startsWith('aria-'))) continue;
    if (name === 'style') {
      const style = sanitizeStyle(attr.value);
      if (style) clone.setAttribute('style', style);
      continue;
    }
    clone.setAttribute(name, attr.value);
  }

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      clone.appendChild(document.createTextNode(child.textContent ?? ''));
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const sanitized = sanitizeElement(child as Element);
      if (sanitized) clone.appendChild(sanitized);
    }
  }

  return clone;
}

function sanitizeKatexHtml(html: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof DOMParser === 'undefined') return html;
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  const clone = document.createElement('div');
  for (const child of Array.from(body.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      clone.appendChild(document.createTextNode(child.textContent ?? ''));
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const sanitized = sanitizeElement(child as Element);
      if (sanitized) clone.appendChild(sanitized);
    }
  }
  return clone.innerHTML;
}

/**
 * Renders KaTeX markup produced by /api/solve. The server compiles every expression with
 * `trust: false`; restored history strings are additionally sanitized here before rendering.
 */
export function Tex({ html, className }: { html: string; className?: string }) {
  const safe = useMemo(() => sanitizeKatexHtml(html), [html]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
}

export function Rich({ value }: { value: RichText }) {
  return (
    <>
      {value.map((segment, i) =>
        segment.kind === 'text' ? <Fragment key={i}>{segment.value}</Fragment> : <Tex key={i} html={segment.html} />,
      )}
    </>
  );
}
