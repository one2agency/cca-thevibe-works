'use client';

import { useEffect } from 'react';
import { getSessionId, captureAttribution } from '@/lib/analytics';

// Маунтиться один раз у layout: створює session_id і фіксує referrer/UTM на першому заході.
export default function AnalyticsInit() {
  useEffect(() => {
    getSessionId();
    captureAttribution();
  }, []);
  return null;
}
