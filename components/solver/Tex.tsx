import { Fragment } from 'react';
import type { RichText } from '@/lib/solver/schema';

/**
 * Renders KaTeX markup produced by /api/solve. The server compiles every expression with
 * `trust: false`, so the markup contains only KaTeX's own elements and inline styles.
 */
export function Tex({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
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
