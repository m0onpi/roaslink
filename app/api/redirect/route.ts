import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const target = searchParams.get('target');

  if (!domain || !target) {
    return new NextResponse('Missing required parameters: domain and target', { status: 400 });
  }

  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain.replace(/^https?:\/\//, ''))) {
    return new NextResponse('Invalid domain format', { status: 400 });
  }

  const script = `
(function() {
  'use strict';
  
  const targetDomain = '${target}';
  const currentDomain = '${domain}';
  
  // Check if we're already on the target domain
  if (window.location.hostname === targetDomain.replace(/^https?:\\/\\//, '')) {
    return;
  }
  
  // Check if we're in a native browser or in-app browser
  const userAgent = navigator.userAgent.toLowerCase();
  const isNativeBrowser = 
    userAgent.includes("safari") && !userAgent.includes("chrome") || // Native Safari
    userAgent.includes("chrome") && !userAgent.includes("instagram") && !userAgent.includes("facebook") && !userAgent.includes("twitter") && !userAgent.includes("whatsapp") || // Native Chrome
    userAgent.includes("firefox") || // Firefox
    userAgent.includes("edge") || // Edge
    userAgent.includes("opera"); // Opera
  
  // Only redirect if NOT in a native browser
  if (isNativeBrowser) {
    return;
  }
  
  // Get current path and preserve it in the redirect
  const currentPath = window.location.pathname + window.location.search;
  const targetUrl = targetDomain + currentPath;
  
  const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  if (isAndroid) {
    // Android: Try opening in Chrome via intent, fallback to normal redirect
    const intentUrl = 'intent://' + targetUrl.replace(/^https?:\\/\\//, '') + '#Intent;scheme=https;package=com.android.chrome;end;';
    window.location.href = intentUrl;
    setTimeout(() => {
      window.location.href = targetUrl; // Fallback if intent fails
    }, 1000);
  } else if (isiOS) {
    // iOS: Try to open in Safari
    const safariUrl = 'x-safari-' + targetUrl;
    window.location.href = safariUrl;
    
    setTimeout(() => {
      const newWindow = window.open(targetUrl, '_self');
      if (!newWindow) {
        showFallbackUI(targetUrl);
      }
    }, 50);
  } else {
    // Default redirect for other platforms
    window.location.replace(targetUrl);
  }
  
  function showFallbackUI(fallbackUrl) {
    const overlay = document.createElement('div');
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
        We couldn't open the link automatically. Please tap the button below to open it in your native browser.
      </p>
      <a href="\${fallbackUrl}" style="
        padding: 12px 24px;
        background: #0070f3;
        color: #fff;
        border-radius: 8px;
        text-decoration: none;
        font-size: 16px;
        font-weight: bold;
      ">
        Open in Native Browser
      </a>
    \`;
    
    document.body.appendChild(overlay);
  }
})();
`;

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
