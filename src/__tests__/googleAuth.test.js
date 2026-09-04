import { beforeEach, describe, expect, it } from 'vitest';
import { buildGoogleOAuthUrl, loadGoogleSdk } from '../utils/googleAuth';

describe('google auth helpers', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    delete window.google;
  });

  it('builds the backend Google OAuth start URL', () => {
    const url = buildGoogleOAuthUrl('http://localhost:5000');

    expect(url).toContain('/api/auth/google');
    expect(url).not.toContain('/api/auth/google/callback');
  });

  it('creates the Google Identity Services script when a client id is provided', async () => {
    const result = await loadGoogleSdk('test-client-id', () => {});

    const script = document.querySelector('#google-gsi-script');
    expect(result).toBe(true);
    expect(script).not.toBeNull();
    expect(script?.getAttribute('src')).toContain('accounts.google.com/gsi/client');
  });
});
