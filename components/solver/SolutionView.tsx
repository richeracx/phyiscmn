'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import type { Solution } from '@/lib/solver/schema';
import { ForceDiagram } from './ForceDiagram';
import { Rich, Tex } from './Tex';

const reveal = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

function Label({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#E5C158]/85">{children}</h3>;
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function SolutionView({ solution }: { solution: Solution }) {
  const { t } = useLanguage();
  const copy = t.solver;
  const sections = copy.sections;
  const hasDiagram = solution.diagram.kind === 'forces' && solution.diagram.forces.length > 0;

  return (
    <motion.article {...reveal} className="space-y-6" aria-labelledby="solution-title">
      <header className="pb-2">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#71717A]">
          {copy.grade(solution.topic.grade)} <span className="px-1.5 text-[#3F3F46]">/</span> {solution.topic.unit}
        </p>
        <h2
          id="solution-title"
          className="mt-3 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-light leading-tight tracking-[-0.03em] text-[#F5F5F7]"
        >
          {solution.topic.title}
        </h2>
      </header>

      <Panel>
        <Label>{sections.problem}</Label>
        <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.75] text-[#D4D4D8]">
          <Rich value={solution.statement} />
        </p>
      </Panel>

      <div className={`grid gap-6 ${hasDiagram ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : 'md:grid-cols-2'}`}>
        <div className="space-y-6">
          <Panel>
            <Label>{sections.given}</Label>
            <dl className="mt-4 divide-y divide-white/[0.06]">
              {solution.given.map((item, i) => {
                const hasSymbol = Boolean(item.symbol && item.symbol.trim().length > 0);
                const hasValue = Boolean(item.value && item.value.trim().length > 0);
                const hasMeaning = Boolean(item.meaning && item.meaning.length > 0);

                return (
                  <div key={i} className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-baseline gap-x-5 py-2.5">
                    <dt className="flex items-baseline gap-2 text-[15px] font-medium text-[#F5F5F7]">
                      {hasSymbol && <Tex html={item.symbol} />}
                      {hasSymbol && hasValue && <span className="font-mono text-[14px] text-[#E5C158]">=</span>}
                      {hasValue && <Tex html={item.value} />}
                      {!hasSymbol && !hasValue && <span className="text-[#E5C158]">•</span>}
                    </dt>
                    <dd className="text-right text-[13px] text-[#A1A1AA]">
                      {hasMeaning && <Rich value={item.meaning} />}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Panel>

          {solution.find.length > 0 && (
            <Panel>
              <Label>{sections.find}</Label>
              <ul className="mt-4 space-y-2.5">
                {solution.find.map((item, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 text-[15px] text-[#F5F5F7]">
                    <span className="font-medium text-[#F5F5F7]">
                      <Tex html={item.symbol} />
                    </span>
                    {item.meaning && item.meaning.length > 0 && (
                      <span className="text-right text-[13px] text-[#A1A1AA]">
                        <Rich value={item.meaning} />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        {hasDiagram ? (
          <Panel className="flex flex-col">
            <Label>{sections.diagram}</Label>
            <div className="mt-4 flex flex-1 items-center">
              <ForceDiagram diagram={solution.diagram} title={sections.diagram} />
            </div>
          </Panel>
        ) : (
          solution.assumptions.length > 0 && <Assumptions solution={solution} title={sections.assumptions} />
        )}
      </div>

      {hasDiagram && solution.assumptions.length > 0 && <Assumptions solution={solution} title={sections.assumptions} />}

      {solution.principles.length > 0 && (
        <section>
          <Label>{sections.principles}</Label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {solution.principles.map((principle, i) => (
              <Panel key={i} className="!p-5">
                <p className="text-[13px] text-[#A1A1AA]">{principle.name}</p>
                <Tex html={principle.formula} className="mt-1 block overflow-x-auto text-[#F5F5F7]" />
              </Panel>
            ))}
          </div>
        </section>
      )}

      <section>
        <Label>{sections.solution}</Label>
        <ol className="mt-5 space-y-0">
          {solution.steps.map((step, i) => (
            <li key={i} className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0">
              {i < solution.steps.length - 1 && (
                <span aria-hidden className="absolute bottom-0 left-[1.1rem] top-9 w-px bg-white/[0.08]" />
              )}
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.12] font-mono text-[11px] text-[#E5C158]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 pt-1.5">
                <h4 className="text-[15.5px] font-medium text-[#F5F5F7]">{step.title}</h4>
                {step.text.length > 0 && (
                  <p className="mt-2 text-[15px] leading-[1.75] text-[#BDBDC4]">
                    <Rich value={step.text} />
                  </p>
                )}
                {step.equations.length > 0 && (
                  <div className="mt-4 space-y-1 rounded-xl border border-white/[0.06] bg-black/40 px-4 py-3">
                    {step.equations.map((equation, j) => (
                      <Tex key={j} html={equation} className="block overflow-x-auto text-[#F5F5F7]" />
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-[#E5C158]/30 bg-[#E5C158]/[0.04] p-6 sm:p-8">
        <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-[#E5C158]" />
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label>{sections.result}</Label>
              {solution.mathVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-medium text-emerald-400">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  {sections.mathVerifiedBadge}
                </span>
              )}
            </div>
            {solution.answers.map((answer, i) => {
              const hasLabel = Boolean(answer.label && answer.label.trim().length > 0);
              const hasExpr = Boolean(answer.expression && answer.expression.trim().length > 0);
              const isSame = hasLabel && hasExpr && answer.label.trim().toLowerCase() === answer.expression.trim().toLowerCase();

              return (
                <div key={i}>
                  {hasLabel && !isSame && <p className="text-[13px] text-[#A1A1AA]">{answer.label}</p>}
                  {hasExpr && (
                    <Tex
                      html={answer.expression}
                      className="mt-1 block overflow-x-auto text-[1.15rem] text-[#F5F5F7] [&_.katex-display]:my-1 [&_.katex-display]:text-left"
                    />
                  )}
                </div>
              );
            })}
          </div>
          {solution.choice && (
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#71717A]">{sections.choice}</span>
              <span className="grid h-14 w-14 place-items-center rounded-full border border-[#E5C158] font-display text-[1.6rem] text-[#E5C158]">
                {solution.choice}
              </span>
            </div>
          )}
        </div>
      </section>

      {solution.check.length > 0 && (
        <Panel>
          <Label>{sections.check}</Label>
          <p className="mt-3 text-[14px] leading-[1.75] text-[#A1A1AA]">
            <Rich value={solution.check} />
          </p>
        </Panel>
      )}

      <p className="pt-2 text-center font-mono text-[10.5px] tracking-[0.06em] text-[#52525B]">{copy.disclaimer}</p>
    </motion.article>
  );
}

function Assumptions({ solution, title }: { solution: Solution; title: string }) {
  return (
    <Panel>
      <Label>{title}</Label>
      <ul className="mt-4 space-y-2.5">
        {solution.assumptions.map((assumption, i) => (
          <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-[#BDBDC4]">
            <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-[#E5C158]/70" />
            <span>
              <Rich value={assumption} />
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
