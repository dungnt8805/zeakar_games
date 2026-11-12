/** Website analytics only. No game saves, scores, account IDs or form values are sent. */
const CONSENT_KEY = 'lamian.analytics-consent.v1';
type Consent = 'granted' | 'denied';
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function initializeAnalytics() {
  const root = document.querySelector<HTMLElement>('#site-analytics');
  const panel = document.querySelector<HTMLElement>('#analytics-choice');
  const settings = document.querySelector<HTMLButtonElement>('#analytics-settings');
  const measurementId = root?.dataset.measurementId;
  if (!root || !panel || !settings || !measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return;
  // Local preview and third-party copies must never contaminate production reports.
  if (!['lamian.dev', 'game.lamian.dev'].includes(location.hostname)) return;
  let consent: string | null = null;
  try { consent = localStorage.getItem(CONSENT_KEY); } catch {}
  let loaded = false;
  const disabled = window as unknown as Record<string, unknown>;
  const showPanel = (show: boolean) => {
    panel.hidden = !show;
    settings.hidden = show;
    settings.setAttribute('aria-expanded', String(show));
  };
  const load = () => {
    disabled[`ga-disable-${measurementId}`] = false;
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
  };
  const track = (name: string, props: Record<string, string> = {}) => {
    if (consent !== 'granted') return;
    window.gtag?.('event', name, { ...props, site_language: document.documentElement.lang });
  };
  const choose = (value: Consent) => {
    consent = value;
    try { localStorage.setItem(CONSENT_KEY, value); } catch {}
    if (value === 'granted') {
      load();
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    } else {
      disabled[`ga-disable-${measurementId}`] = true;
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of ['', '; domain=lamian.dev', '; domain=.lamian.dev']) {
          document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax; Secure`;
        }
      }
    }
    showPanel(false);
    settings.focus({ preventScroll: true });
  };
  settings.addEventListener('click', () => {
    showPanel(true);
    panel.querySelector<HTMLButtonElement>('button')?.focus();
  });
  root.querySelectorAll<HTMLButtonElement>('[data-analytics-choice]').forEach(button => {
    button.addEventListener('click', () => choose(button.dataset.analyticsChoice as Consent));
  });
  showPanel(consent !== 'granted' && consent !== 'denied');
  if (consent === 'granted') load();

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const anchor = target?.closest('a');
    if (anchor) {
      const url = new URL(anchor.href, location.href);
      const store = url.hostname === 'play.google.com' ? 'google_play' : url.hostname === 'apps.apple.com' ? 'app_store' : '';
      if (store) track('store_click', { store, app_id: url.searchParams.get('id') || url.pathname.split('/').pop() || 'developer' });
    }
    if (target?.closest('#aster-playable-start')) track('demo_open', { game_id: 'aster-strike' });
    if (target?.closest('#play-fullscreen')) track('game_fullscreen', { game_id: location.pathname.split('/').filter(Boolean).pop() || '' });
  });
  document.addEventListener('load', event => {
    const iframe = event.target;
    if (!(iframe instanceof HTMLIFrameElement)) return;
    const url = new URL(iframe.src, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith('/playable/')) return;
    // This measures an iframe load, not a completed game initialization or a human play session.
    track('game_frame_load', { game_id: url.pathname.split('/')[2] || '' });
  }, true);
}
