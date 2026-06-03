import type { Metadata } from 'next';
import Link from 'next/link';
import { DOMAINS } from '@/lib/exam-bank';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Формат екзамену Claude Certified Architect Foundations',
  description: 'Детальний опис формату CCA-F: 60 питань, 120 хвилин, scaled score 100–1000, прохідний поріг 720. Розподіл за доменами та сценаріями.',
  alternates: { canonical: '/format' },
  openGraph: { url: 'https://cca.thevibe.works/format' },
};

export default function FormatPage() {
  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'Формат екзамену', href: '/format' }]} />

      <div className="page-header">
        <h1>Формат екзамену CCA Foundations</h1>
        <p>Все, що потрібно знати перед реєстрацією на іспит</p>
      </div>

      <div className="prose">
        <div className="card" style={{ padding: '24px 28px', marginBottom: 32 }}>
          <div className="factrow" style={{ margin: 0 }}>
            <div className="fact"><b>60</b><span>питань</span></div>
            <div className="fact"><b>120</b><span>хвилин</span></div>
            <div className="fact"><b>720</b><span>прохідний поріг</span></div>
            <div className="fact"><b>100–1000</b><span>scaled score</span></div>
            <div className="fact"><b>4 / 6</b><span>сценаріїв</span></div>
          </div>
        </div>

        <h2>Загальна структура</h2>
        <p>
          Іспит Claude Certified Architect — Foundations (CCA-F) складається з <strong>60 питань із множинним вибором</strong> (одна правильна з чотирьох).
          На виконання відведено <strong>120 хвилин</strong>. Питання прив&apos;язані до виробничих сценаріїв — на кожній сесії
          випадково обирається <strong>4 сценарії з 6</strong>, і з кожного береться по 15 питань.
        </p>

        <h2>Система балів</h2>
        <p>
          Результат виражається у <em>scaled score</em> від 100 до 1000. Це не відсотки — бали масштабуються,
          щоб врахувати складність конкретної версії іспиту. <strong>Прохідний поріг — 720 балів</strong>.
          У тренажері використовується спрощена лінійна модель: 100 + (частка правильних × 900).
        </p>

        <h2>Шість виробничих сценаріїв</h2>
        <p>
          Усі питання подаються в контексті реального бізнес-кейсу. Ти бачиш опис системи й вирішуєш
          архітектурні або операційні задачі в її рамках. Ознайомся з усіма сценаріями заздалегідь —
          це допоможе орієнтуватися під час іспиту.
        </p>
        <p>
          Детальний опис усіх 6 сценаріїв:{' '}
          <Link href="/scenariyi">Виробничі сценарії →</Link>
        </p>

        <h2>Розподіл за доменами</h2>
        <p>
          Питання охоплюють п&apos;ять доменів. Вага домену відображає, яка частка питань з нього
          буде на іспиті. Починай підготовку з найважчих за вагою.
        </p>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Домен</th>
              <th>Вага</th>
              <th>Питань (~)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(DOMAINS).map(([k, v]) => (
              <tr key={k}>
                <td><span className="tag">D{k}</span></td>
                <td><Link href={`/domeny/${v.slug}`}>{v.nameUk}</Link></td>
                <td><strong>{v.w}%</strong></td>
                <td>{Math.round(60 * v.w / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Тип питань</h2>
        <p>
          Всі питання — <strong>scenario-based multiple choice</strong>: ти читаєш контекст сценарію,
          потім конкретне технічне питання, і обираєш найкращу з чотирьох відповідей.
          Зазвичай є одна явно правильна і три правдоподібних, але хибних варіанти.
        </p>

        <h2>Чого очікувати</h2>
        <ul>
          <li>Питання перевіряють розуміння, а не зубріння — треба вміти застосовувати концепції.</li>
          <li>Часто зустрічаються anti-patterns як варіанти відповідей.</li>
          <li>Правильні відповіді враховують пріоритет детермінованих рішень над ймовірнісними.</li>
          <li>Особливу увагу приділяють безпеці (human-in-the-loop) та надійності.</li>
        </ul>

        <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/trenazher" className="btn accent">Спробувати тренажер →</Link>
          <Link href="/pidgotovka" className="btn ghost">Гайд підготовки</Link>
        </div>
      </div>
    </div>
  );
}
