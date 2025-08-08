(function () {
  'use strict';

  const baseUrl = '__TARGET__';
  let needsUserAction = false;

  function debugLog(message) {
    // console.log('[DEBUG]', message); // Uncomment if needed
  }

  debugLog('Script loaded on: ' + window.location.href);
  debugLog('Target domain: ' + baseUrl);

  if (window.location.hostname === baseUrl.replace(/^https?:\/\//, '')) {
    debugLog('Already on target domain, skipping redirect');
    return;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  debugLog('User agent: ' + userAgent);

  const isNativeBrowser =
    (userAgent.includes('safari') && !userAgent.includes('chrome')) ||
    (userAgent.includes('chrome') &&
      !userAgent.includes('instagram') &&
      !userAgent.includes('facebook') &&
      !userAgent.includes('twitter')) ||
    userAgent.includes('firefox') ||
    userAgent.includes('edge') ||
    userAgent.includes('opera');

  debugLog('Is native browser: ' + isNativeBrowser);

  if (isNativeBrowser) {
    debugLog('User is in native browser, no redirect needed');
    return;
  }

  debugLog('User is in in-app browser, proceeding with redirect');

  const currentPath = window.location.pathname + window.location.search;
  const targetUrl = baseUrl + currentPath;
  debugLog('Current path: ' + currentPath);
  debugLog('Target URL: ' + targetUrl);

  const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  debugLog('Is iOS: ' + isiOS);
  debugLog('Is Android: ' + isAndroid);

  function showFallbackUI() {
    debugLog('Showing fallback UI');

    if (document.getElementById('smartredirect-overlay')) {
      debugLog('Overlay already exists, skipping');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'smartredirect-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      text-align: center;
      color: white;
    `;

    overlay.innerHTML = `
      <p style="margin-bottom: 20px; font-size: 16px;">
        We couldn't open the link automatically. Please tap the button below to open it in Safari.
      </p>
      <a href="${targetUrl}" style="
        padding: 12px 24px;
        background: #0070f3;
        color: #fff;
        border-radius: 8px;
        text-decoration: none;
        font-size: 16px;
        font-weight: bold;
      ">
        Open in Safari
      </a>
    `;

    document.body.appendChild(overlay);
    debugLog('Fallback UI added to DOM');
  }

  debugLog('Starting redirect process...');

  if (isAndroid) {
    debugLog('Using Android redirect method');
    const intentUrl =
      'intent://' +
      targetUrl.replace(/^https?:\/\//, '') +
      '#Intent;scheme=https;package=com.android.chrome;end;';
    debugLog('Intent URL: ' + intentUrl);
    window.location.href = intentUrl;

    setTimeout(() => {
      debugLog('Android fallback: redirecting to ' + targetUrl);
      window.location.href = targetUrl;
    }, 1000);
  } else if (isiOS) {
    debugLog('Using iOS redirect method');
    const iostargetUrl = 'x-safari-' + targetUrl;
    debugLog('iOS Safari URL: ' + iostargetUrl);
    window.location.href = iostargetUrl;

    setTimeout(() => {
      debugLog('iOS fallback: trying window.open');
      const newWindow = window.open(iostargetUrl, '_self');
      if (!newWindow) {
        debugLog('iOS window.open failed, showing fallback UI');
        showFallbackUI();
      } else {
        debugLog('iOS window.open successful');
        newWindow.opener = true;
      }
    }, 50);
  } else {
    debugLog('Using default redirect method');
    window.location.replace(targetUrl);
  }
})();
