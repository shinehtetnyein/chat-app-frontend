export const buildGoogleOAuthUrl = (apiBaseUrl = 'http://localhost:5000') => {
  const normalizedBaseUrl = (apiBaseUrl || 'http://localhost:5000').trim();
  const redirectOrigin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'http://localhost:5173';
  const url = new URL('/api/auth/google', normalizedBaseUrl);
  url.searchParams.set('redirect', redirectOrigin);
  return url.toString();
};

export const loadGoogleSdk = (clientId, onLoaded) => {
  return new Promise((resolve) => {
    const finish = () => {
      onLoaded?.();
      resolve(true);
    };

    if (!clientId) {
      resolve(false);
      return;
    }

    if (window.google?.accounts?.id) {
      finish();
      return;
    }

    if (document.getElementById('google-gsi-script')) {
      const check = () => {
        if (window.google?.accounts?.id) {
          finish();
        } else {
          window.setTimeout(check, 100);
        }
      };
      check();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = finish;
    script.onerror = () => resolve(false);
    document.head.appendChild(script);

    window.setTimeout(() => {
      if (window.google?.accounts?.id) {
        finish();
      } else {
        resolve(true);
      }
    }, 0);
  });
};
