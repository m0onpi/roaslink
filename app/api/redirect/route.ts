import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');

  if (!target) {
    return new NextResponse('Missing required parameter: target', { status: 400 });
  }

  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(target.replace(/^https?:\/\//, ''))) {
    return new NextResponse('Invalid domain format', { status: 400 });
  }

  const script = `
(function() {
  'use strict';
  
  // Configuration - users can modify these values
  const TARGET_DOMAIN = '${target}';
  const ENABLE_REDIRECT = true; // Set to false to disable redirect functionality
  
  // Don't run if redirect is disabled
  if (!ENABLE_REDIRECT) {
    return;
  }
  
  // Check if we're already on the target domain
  if (window.location.hostname === TARGET_DOMAIN.replace(/^https?:\\/\\//, '')) {
    return;
  }
  
  // Check if we're in a native browser or in-app browser
  const userAgent = navigator.userAgent.toLowerCase();
  const isNativeBrowser = 
    userAgent.includes("safari") && !userAgent.includes("chrome") || // Native Safari
    userAgent.includes("chrome") && !userAgent.includes("instagram") && !userAgent.includes("facebook") && !userAgent.includes("twitter") && !userAgent.includes("whatsapp") && !userAgent.includes("tiktok") && !userAgent.includes("snapchat") || // Native Chrome
    userAgent.includes("firefox") || // Firefox
    userAgent.includes("edge") || // Edge
    userAgent.includes("opera"); // Opera
  
  // Only redirect if NOT in a native browser
  if (isNativeBrowser) {
    return;
  }
  
  // Get current path and preserve it in the redirect
  const currentPath = window.location.pathname + window.location.search;
  const targetUrl = TARGET_DOMAIN + currentPath;
  
  const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  // Function to show fallback UI
  function showFallbackUI(fallbackUrl) {
    // Check if overlay already exists
    if (document.getElementById('smartredirect-overlay')) {
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
      z-index: 999999;
      padding: 20px;
      text-align: center;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    \`;
    
    overlay.innerHTML = \`
      <div style="max-width: 400px; width: 100%;">
        <h2 style="margin-bottom: 20px; font-size: 24px; font-weight: 600;">
          Open in Browser
        </h2>
        <p style="margin-bottom: 30px; font-size: 16px; line-height: 1.5; opacity: 0.9;">
          For the best experience, please open this link in your native browser.
        </p>
        <a href="\${fallbackUrl}" style="
          display: inline-block;
          padding: 14px 28px;
          background: #0070f3;
          color: #fff;
          border-radius: 8px;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          transition: background-color 0.2s;
        " onmouseover="this.style.backgroundColor='#0051cc'" onmouseout="this.style.backgroundColor='#0070f3'">
          Open in Browser
        </a>
        <button onclick="document.getElementById('smartredirect-overlay').remove()" style="
          display: block;
          margin-top: 16px;
          padding: 8px 16px;
          background: transparent;
          color: #ccc;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        " onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor='transparent'">
          Continue in App
        </button>
      </div>
    \`;
    
    document.body.appendChild(overlay);
  }
  
  // Function to attempt redirect
  function attemptRedirect() {
    if (isAndroid) {
      // Android: Try opening in Chrome via intent, fallback to normal redirect
      const intentUrl = 'intent://' + targetUrl.replace(/^https?:\\/\\//, '') + '#Intent;scheme=https;package=com.android.chrome;end;';
      window.location.href = intentUrl;
      
      // Fallback after a short delay
      setTimeout(() => {
        if (window.location.href !== targetUrl) {
          showFallbackUI(targetUrl);
        }
      }, 1500);
    } else if (isiOS) {
      // iOS: Try multiple approaches
      let redirectAttempted = false;
      
      // Method 1: Try Safari-specific URL
      try {
        const safariUrl = 'x-safari-' + targetUrl;
        window.location.href = safariUrl;
        redirectAttempted = true;
      } catch (e) {
        // Fallback
      }
      
      // Method 2: Try window.open
      setTimeout(() => {
        if (!redirectAttempted) {
          const newWindow = window.open(targetUrl, '_self');
          if (!newWindow) {
            showFallbackUI(targetUrl);
          }
        } else {
          // Check if we're still on the same page
          setTimeout(() => {
            if (window.location.href.indexOf(targetUrl) === -1) {
              showFallbackUI(targetUrl);
            }
          }, 1000);
        }
      }, 100);
    } else {
      // Default redirect for other platforms
      try {
        window.location.replace(targetUrl);
      } catch (e) {
        showFallbackUI(targetUrl);
      }
    }
  }
  
  // Execute redirect
  attemptRedirect();
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
