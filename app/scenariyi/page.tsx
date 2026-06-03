import type { Metadata } from 'next';
import Link from 'next/link';
import { SCEN, getQuestionsByScenario } from '@/lib/exam-bank';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '6 виробничих сценаріїв екзамену CCA-F',
  description: 'Опис шести виробничих сценаріїв іспиту Claude Certified Architect Foundations: Customer Support Agent, Code Generation, Multi-Agent Research та інші.',
  alternates: { canonical: '/scenariyi' },
  openGraph: { url: 'https://cca.thevibe.works/scenariyi' },
};

const LETTERS = ['A', 'B', 'C', 'D'];

export default function ScenарiyiPage() {
  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'Сценарії', href: '/scenariyi' }]} />

      <div className="page-header">
        <h1>6 виробничих сценаріїв екзамену CCA-F</h1>
        <p>На кожній сесії випадково обирається 4 з 6 сценаріїв. Знайомство з усіма — перевага.</p>
      </div>

      {Object.entries(SCEN).map(([k, sc]) => {
        const sampleQs = getQuestionsByScenario(+k).slice(0, 2);
        return (
          <section key={k} style={{ marginBottom: 48 }}>
            <div className="card" style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <span className="tag">Сценарій {k}</span>
              </div>
              <h2 style={{ fontSize: 22, marginBottom: 10 }}>{sc.t}</h2>
              <p style={{ margin: '0 0 20px', color: 'var(--ink2)', fontSize: 16 }}>{sc.p}</p>

              {sampleQs.length > 0 && (
                <>
                  <h3 style={{ fontSize: 16, marginBottom: 12, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink2)' }}>
                    Приклади питань
                  </h3>
                  {sampleQs.map((q, qi) => (
                    <div key={q.id} className="card q-static" style={{ marginBottom: 12 }}>
                      <div className="qmeta" style={{ marginBottom: 10 }}>
                        <span className="tag">Домен {q.d}</span>
                        <span className="qnum">{qi + 1} / {sampleQs.length}</span>
                      </div>
                      <div className="q-text">{q.q}</div>
                      {q.opts.map((o, i) => (
                        <div key={i} className={`opt${i === q.a ? ' correct' : ''}`}>
                          <span className="k">{LETTERS[i]}</span>
                          <span>{o}</span>
                        </div>
                      ))}
                      <div className="q-ex">
                        <strong>✓ {LETTERS[q.a]}</strong> — {q.ex}
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div style={{ marginTop: 16 }}>
                <Link href={`/trenazher?scenario=${k}`} style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: 13 }}>
                  Практика за сценарієм {k} →
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      <div style={{ marginTop: 16, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link href="/trenazher" className="btn accent">Запустити тренажер →</Link>
        <Link href="/domeny" className="btn ghost">Домени екзамену</Link>
      </div>
    </div>
  );
}
