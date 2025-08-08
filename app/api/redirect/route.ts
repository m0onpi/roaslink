import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');
  const debug = searchParams.get('debug') === 'true';

  if (!target) {
    return new NextResponse('Missing required parameter: target', { status: 400 });
  }

  // Basic domain validation - supports .co.uk, .com.au, etc.
  const cleanTarget = target.replace(/^https?:\/\//, '');
  // More permissive regex that handles subdomains and multi-level TLDs
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(cleanTarget)) {
    return new NextResponse('Invalid domain format', { status: 400 });
  }

  const script = `(function() {
  'use strict';
  
  const baseUrl = '${target}';
  let needsUserAction = false;
  
  // Debug logging function
  function debugLog(message) {
    
  }
  
  debugLog('Script loaded on: ' + window.location.href);
  debugLog('Target domain: ' + baseUrl);
  
  // Check if we're already on the target domain
  if (window.location.hostname === baseUrl.replace(/^https?:\\/\\//, '')) {
    debugLog('Already on target domain, skipping redirect');
    return;
  }
  
  // Check if we're in a native browser or in-app browser
  const userAgent = navigator.userAgent.toLowerCase();
  debugLog('User agent: ' + userAgent);
  
  const isNativeBrowser = 
    userAgent.includes("safari") && !userAgent.includes("chrome") || // Native Safari
    userAgent.includes("chrome") && !userAgent.includes("instagram") && !userAgent.includes("facebook") && !userAgent.includes("twitter") || // Native Chrome
    userAgent.includes("firefox") || // Firefox
    userAgent.includes("edge") || // Edge
    userAgent.includes("opera"); // Opera
  
  debugLog('Is native browser: ' + isNativeBrowser);
  
  // Only redirect if NOT in a native browser
  if (isNativeBrowser) {
    debugLog('User is in native browser, no redirect needed');
    return;
  }
  
  debugLog('User is in in-app browser, proceeding with redirect');
  
  // Get current path and preserve it in the redirect
  const currentPath = window.location.pathname + window.location.search;
  const targetUrl = baseUrl + currentPath;
  debugLog('Current path: ' + currentPath);
  debugLog('Target URL: ' + targetUrl);
  
  const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  debugLog('Is iOS: ' + isiOS);
  debugLog('Is Android: ' + isAndroid);
  
  // Function to show fallback UI
  function showFallbackUI() {
    debugLog('Showing fallback UI');
    
    // Check if overlay already exists
    if (document.getElementById('smartredirect-overlay')) {
      debugLog('Overlay already exists, skipping');
      return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'smartredirect-overlay';
    overlay.style.cssText = \`
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
    \`;
    
    overlay.innerHTML = \`
      <p style="margin-bottom: 20px; font-size: 16px;">
        We couldn't open the link automatically. Please tap the button below to open it in Safari.
      </p>
      <a href="\${targetUrl}" style="
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
    \`;
    
    document.body.appendChild(overlay);
    debugLog('Fallback UI added to DOM');
  }
  
  // Execute redirect logic
  debugLog('Starting redirect process...');
  
  if (isAndroid) {
    debugLog('Using Android redirect method');
    // Android: Try opening in Chrome via intent, fallback to normal redirect
    const intentUrl = 'intent://' + targetUrl.replace(/^https?:\\/\\//, '') + '#Intent;scheme=https;package=com.android.chrome;end;';
    debugLog('Intent URL: ' + intentUrl);
    window.location.href = intentUrl;
    
    setTimeout(() => {
      debugLog('Android fallback: redirecting to ' + targetUrl);
      window.location.href = targetUrl; // Fallback if intent fails
    }, 1000);
  } else if (isiOS) {
    debugLog('Using iOS redirect method');
    const iostargetUrl = 'x-safari-' + targetUrl;
    debugLog('iOS Safari URL: ' + iostargetUrl);
    window.location.href = iostargetUrl;
    
    // iOS: Open in Safari
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
    // Default redirect for other platforms
    window.location.replace(targetUrl);
  }
})();`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
