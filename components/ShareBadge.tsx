'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

interface Props {
  score: number;
  pass: boolean;
}

interface Tier { emoji: string; label: string; min: number; }
const TIERS: Tier[] = [
  { emoji: '🏆', label: 'Майстер', min: 960 },
  { emoji: '🥇', label: 'Золото', min: 900 },
  { emoji: '🥈', label: 'Срібло', min: 800 },
  { emoji: '🥉', label: 'Прохідний', min: 720 },
  { emoji: '📚', label: 'Готуюсь', min: 0 },
];
const tierFor = (s: number) => TIERS.find(t => s >= t.min) ?? TIERS[TIERS.length - 1];

export default function ShareBadge({ score, pass }: Props) {
  const [nick, setNick] = useState('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const tier = tierFor(score);

  async function createShare() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, nick }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Помилка');
        setBusy(false);
        return;
      }
      setShareUrl(data.url);
      setToken(data.token);
      track('share_created', { score, tier: tier.label, has_nick: Boolean(nick) });
    } catch {
      setError('Не вдалося створити бейдж');
    }
    setBusy(false);
  }

  function shareTo(channel: string, url: string) {
    track('share_clicked', { channel, score });
    window.open(url, '_blank', 'noopener');
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      track('share_clicked', { channel: 'copy', score });
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  async function nativeShare() {
    if (!shareUrl) return;
    track('share_clicked', { channel: 'native', score });
    try {
      if (navigator.share) {
        await navigator.share({ title: `Мій результат на CCA-тренажері: ${score}`, url: shareUrl });
      }
    } catch { /* user cancelled */ }
  }

  function downloadPng() {
    if (!token) return;
    track('share_clicked', { channel: 'download', score });
    const a = document.createElement('a');
    a.href = `/api/og/${token}`;
    a.download = `cca-badge-${score}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const enc = encodeURIComponent;
  const shareText = `Мій результат на тренажері Claude Certified Architect Foundations: ${score}/1000 ${tier.emoji}`;

  return (
    <div className="card" style={{ padding: '22px 24px', marginTop: 16 }}>
      <h3 style={{ fontSize: 18, marginBottom: 4 }}>Поділитися результатом</h3>
      <p className="muted" style={{ fontSize: 14, marginTop: 0, marginBottom: 16 }}>
        Згенеруй бейдж із балом і поділись у соцмережах.
      </p>

      {/* Прев'ю (локальне) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px',
        background: 'var(--paper2)', borderRadius: 12, marginBottom: 16,
      }}>
        <div style={{ fontSize: 44 }}>{tier.emoji}</div>
        <div>
          <div style={{ fontFamily: 'var(--disp)', fontSize: 32, fontWeight: 700, color: pass ? 'var(--good)' : 'var(--accent)', lineHeight: 1 }}>
            {score}
          </div>
          <div className="muted" style={{ fontSize: 13 }}>{tier.label}{nick ? ` · ${nick}` : ''}</div>
        </div>
      </div>

      {!shareUrl ? (
        <>
          <input
            type="text"
            value={nick}
            onChange={e => setNick(e.target.value)}
            placeholder="Нікнейм (опційно)"
            maxLength={24}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 10,
              border: '1px solid var(--line)', background: 'var(--card)',
              fontFamily: 'var(--serif)', fontSize: 15, marginBottom: 12,
            }}
          />
          {error && <p style={{ color: 'var(--bad)', fontSize: 14, margin: '0 0 12px' }}>{error}</p>}
          <button className="btn accent" onClick={createShare} disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
            {busy ? 'Створюю…' : 'Створити бейдж →'}
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn ghost" style={{ justifyContent: 'center', fontSize: 14 }}
              onClick={() => shareTo('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`)}>
              in LinkedIn
            </button>
            <button className="btn ghost" style={{ justifyContent: 'center', fontSize: 14 }}
              onClick={() => shareTo('facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`)}>
              Facebook
            </button>
            <button className="btn ghost" style={{ justifyContent: 'center', fontSize: 14 }}
              onClick={() => shareTo('x', `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(shareText)}`)}>
              X / Twitter
            </button>
            <button className="btn ghost" style={{ justifyContent: 'center', fontSize: 14 }}
              onClick={() => shareTo('telegram', `https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(shareText)}`)}>
              Telegram
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn ghost" style={{ justifyContent: 'center', fontSize: 14 }} onClick={downloadPng}>
              ↓ Завантажити PNG
            </button>
            <button className="btn ghost" style={{ justifyContent: 'center', fontSize: 14 }} onClick={copyLink}>
              {copied ? '✓ Скопійовано' : '🔗 Скопіювати'}
            </button>
          </div>
          <button className="btn ghost" style={{ justifyContent: 'center', fontSize: 14 }} onClick={nativeShare}>
            📲 Поділитися (Instagram/інше)
          </button>
          <a href={shareUrl} target="_blank" rel="noopener" className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            Переглянути сторінку бейджа →
          </a>
        </div>
      )}
    </div>
  );
}
