'use client';

// Клієнтська аналітика: session_id у localStorage, referrer/UTM на першому заході,
// надсилання подій у /api/event (best-effort, не блокує UX).

const SID_KEY = 'cca_sid';
const ATTR_KEY = 'cca_attr';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) {
    sid = `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

interface Attribution {
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  const existing = localStorage.getItem(ATTR_KEY);
  if (existing) {
    try { return JSON.parse(existing); } catch { /* ignore */ }
  }
  const params = new URLSearchParams(window.location.search);
  let referrer = '';
  try {
    referrer = document.referrer ? new URL(document.referrer).host : '';
  } catch { /* ignore */ }
  const attr: Attribution = {
    referrer: referrer || undefined,
    utm_source: params.get('utm_source') ?? undefined,
    utm_medium: params.get('utm_medium') ?? undefined,
    utm_campaign: params.get('utm_campaign') ?? undefined,
  };
  localStorage.setItem(ATTR_KEY, JSON.stringify(attr));
  return attr;
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(ATTR_KEY) ?? '{}'); } catch { return {}; }
}

export function track(type: string, meta: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  try {
    const body = JSON.stringify({ type, session_id: getSessionId(), meta });
    // sendBeacon не дає виставити Content-Type; fetch keepalive надійніший для JSON
    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore */ }
}
