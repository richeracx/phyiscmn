'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import type { SingleSolution, Solution } from '@/lib/solver/schema';
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
  const { t, lang } = useLanguage();
  const copy = t.solver;
  const sections = copy.sections;

  const problems = solution.problems && solution.problems.length > 0 ? solution.problems : [solution];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeIdx = Math.min(selectedIdx, problems.length - 1);
  const current = problems[activeIdx];
  const hasDiagram = current.diagram.kind === 'forces' && current.diagram.forces.length > 0;

  // Filter out empty placeholder answer cards
  const validAnswers = current.answers.filter((answer) => {
    const expr = answer.expression?.trim();
    const lbl = answer.label?.trim();
    return Boolean(expr || (lbl && lbl !== 'Sonuç' && lbl !== 'Result'));
  });

  // Filter out empty placeholder steps
  const validSteps = current.steps.filter((step) => {
    const textHasContent = step.text.some((part) =>
      part.kind === 'text' ? part.value.trim().length > 0 : part.html.trim().length > 0,
    );
    const eqHasContent = step.equations.length > 0;
    const isPlaceholder =
      step.title === 'Çözüm' &&
      step.text.length === 1 &&
      step.text[0].kind === 'text' &&
      step.text[0].value === 'Çözüm adımları';
    return (textHasContent || eqHasContent) && !isPlaceholder;
  });
  const hasSteps = current.steps.length > 0 || validSteps.length > 0;

  const isCompletelyEmpty =
    current.statement.length === 0 &&
    current.given.length === 0 &&
    !hasSteps &&
    validAnswers.length === 0 &&
    !current.choice;

  if (isCompletelyEmpty) {
    return (
      <Panel className="p-8 text-center">
        <p className="text-[15px] text-[#A1A1AA]">
          {lang === 'tr'
            ? 'Bu soru için ayrıştırılmış bir çözüm bulunamadı. Lütfen soruyu daha net veya kırpılmış şekilde tekrar deneyin.'
            : 'No parsed solution could be extracted for this problem. Please re-try with a clearer image.'}
        </p>
      </Panel>
    );
  }

  return (
    <motion.article {...reveal} className="space-y-6" aria-labelledby="solution-title">
      {/* Multi-Question Worksheet Switcher */}
      {problems.length > 1 && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#E5C158]">
              {lang === 'tr' ? 'Çözülen Sorular' : 'Solved Questions'} ({problems.length})
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {problems.map((prob, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-[13px] transition-all duration-200 ${
                    activeIdx === idx
                      ? 'bg-[#E5C158] text-black font-semibold shadow-md shadow-[#E5C158]/20'
                      : 'border border-white/10 bg-white/[0.04] text-[#A1A1AA] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span>{lang === 'tr' ? `Soru ${idx + 1}` : `Problem ${idx + 1}`}</span>
                  {prob.mathVerified && (
                    <span
                      className={`h-2 w-2 rounded-full ${activeIdx === idx ? 'bg-emerald-950' : 'bg-emerald-400'}`}
                      title={sections.mathVerifiedBadge}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="pb-2">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#71717A]">
          {copy.grade(current.topic.grade)} <span className="px-1.5 text-[#3F3F46]">/</span> {current.topic.unit}
        </p>
        <h2
          id="solution-title"
          className="mt-3 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-light leading-tight tracking-[-0.03em] text-[#F5F5F7]"
        >
          {current.topic.title}
        </h2>
      </header>

      {current.statement.length > 0 && (
        <Panel>
          <Label>{sections.problem}</Label>
          <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.75] text-[#D4D4D8]">
            <Rich value={current.statement} />
          </p>
        </Panel>
      )}

      {(current.given.length > 0 || current.find.length > 0 || hasDiagram) && (
        <div className={`grid gap-6 ${hasDiagram ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : 'md:grid-cols-2'}`}>
          <div className="space-y-6">
            {current.given.length > 0 && (
              <Panel>
                <Label>{sections.given}</Label>
                <dl className="mt-4 divide-y divide-white/[0.06]">
                  {current.given.map((item, i) => {
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
            )}

            {current.find.length > 0 && (
              <Panel>
                <Label>{sections.find}</Label>
                <ul className="mt-4 space-y-2.5">
                  {current.find.map((item, i) => (
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
                <ForceDiagram diagram={current.diagram} title={sections.diagram} />
              </div>
            </Panel>
          ) : (
            current.assumptions.length > 0 && <Assumptions solution={current} title={sections.assumptions} />
          )}
        </div>
      )}

      {hasDiagram && current.assumptions.length > 0 && <Assumptions solution={current} title={sections.assumptions} />}

      {current.principles.length > 0 && (
        <section>
          <Label>{sections.principles}</Label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {current.principles.map((principle, i) => (
              <Panel key={i} className="!p-5">
                <p className="text-[13px] text-[#A1A1AA]">{principle.name}</p>
                <Tex html={principle.formula} className="mt-1 block overflow-x-auto text-[#F5F5F7]" />
              </Panel>
            ))}
          </div>
        </section>
      )}

      {hasSteps && (
        <section>
          <Label>{sections.solution}</Label>
          <ol className="mt-5 space-y-0">
            {validSteps.map((step, i) => (
              <li key={i} className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0">
                {i < validSteps.length - 1 && (
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
      )}

      {(validAnswers.length > 0 || current.choice) && (
        <section className="relative overflow-hidden rounded-2xl border border-[#E5C158]/30 bg-[#E5C158]/[0.04] p-6 sm:p-8">
          <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-[#E5C158]" />
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 flex-1 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Label>{sections.result}</Label>
                {current.mathVerified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-medium text-emerald-400">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    {sections.mathVerifiedBadge}
                  </span>
                )}
              </div>
              {validAnswers.map((answer, i) => {
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
            {current.choice && (
              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#71717A]">{sections.choice}</span>
                <span className="grid h-14 w-14 place-items-center rounded-full border border-[#E5C158] font-display text-[1.6rem] text-[#E5C158]">
                  {current.choice}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {current.check.length > 0 && (
        <Panel>
          <Label>{sections.check}</Label>
          <p className="mt-3 text-[14px] leading-[1.75] text-[#A1A1AA]">
            <Rich value={current.check} />
          </p>
        </Panel>
      )}

      <p className="pt-2 text-center font-mono text-[10.5px] tracking-[0.06em] text-[#52525B]">{copy.disclaimer}</p>
    </motion.article>
  );
}

function Assumptions({ solution, title }: { solution: SingleSolution; title: string }) {
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
