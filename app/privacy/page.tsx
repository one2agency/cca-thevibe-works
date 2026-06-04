import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Політика приватності',
  description: 'Що збирає CCA Тренажер: анонімні події використання, добровільний нікнейм для бейджа, звернення в Telegram-боті. Навіщо, скільки зберігаємо, контакт.',
  alternates: { canonical: '/privacy' },
  openGraph: { url: 'https://cca.thevibe.works/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'Приватність', href: '/privacy' }]} />

      <div className="page-header">
        <h1>Політика приватності</h1>
        <p>Коротко й чесно: що збираємо і навіщо</p>
      </div>

      <div className="prose">
        <h2>Що ми збираємо</h2>
        <ul>
          <li>
            <strong>Анонімні події використання</strong> — факт проходження тесту, бал, режим,
            джерело переходу (referrer/UTM), кліки на кнопки шерінгу й Telegram. Прив&apos;язані до
            випадкового <code>session_id</code> у твоєму браузері, <strong>без імені, email чи IP</strong>.
          </li>
          <li>
            <strong>Добровільний нікнейм</strong> — лише якщо ти сам вписав його при створенні бейджа.
            Він вшивається у підписане посилання бейджа. Ім&apos;я не обов&apos;язкове — бейдж працює й без нього.
          </li>
          <li>
            <strong>Звернення в Telegram-боті</strong> — якщо ти пишеш боту (фідбек, заявка), ми бачимо
            твоє повідомлення, Telegram-username та id, щоб відповісти.
          </li>
        </ul>

        <h2>Чого ми НЕ збираємо</h2>
        <ul>
          <li>Не збираємо ім&apos;я, email чи телефон (якщо ти сам не написав їх у зверненні боту).</li>
          <li>Не використовуємо сторонні трекери чи рекламні піксели.</li>
          <li>Результати тренажера зберігаються <strong>лише у твоєму браузері</strong> (localStorage), не на сервері.</li>
        </ul>

        <h2>Навіщо</h2>
        <p>
          Анонімна аналітика допомагає зрозуміти, скільки людей користується тренажером, які домени
          найскладніші й звідки приходить аудиторія — щоб покращувати матеріал. Звернення в боті — щоб
          відповісти на твій фідбек чи заявку.
        </p>

        <h2>Скільки зберігаємо</h2>
        <p>
          Анонімні події — до 12 місяців. Нікнейм у бейджі живе стільки, скільки існує посилання
          (його не можна відкликати — тому не вписуй приватних даних). Звернення в боті зберігаються
          у нашому Telegram-чаті до вирішення питання.
        </p>

        <h2>Контакт</h2>
        <p>
          Питання щодо приватності — напиши в{' '}
          <a href="https://t.me/ClaudeCA_ua_bot?start=feedback" target="_blank" rel="noopener">Telegram-бот</a>{' '}
          або на <a href="mailto:sales@thevibe.works">sales@thevibe.works</a>.
        </p>

        <div style={{ marginTop: 32 }}>
          <Link href="/" className="btn ghost">← На головну</Link>
        </div>
      </div>
    </div>
  );
}
