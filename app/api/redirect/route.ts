import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');
  const debug = searchParams.get('debug') === 'true';

  if (!target) {
    return new NextResponse('Missing required parameter: target', { status: 400 });
  }

  // Robust domain validation - supports subdomains and multi-level TLDs like .co.uk, .com.au
  const cleanTarget = target.replace(/^https?:\/\//, '');
  
  // Function to validate domain format
  function isValidDomain(domain: string): boolean {
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '');
    
    // Basic structure check
    if (!cleanDomain || cleanDomain.length > 253) {
      return false;
    }
    
    // Split by dots
    const parts = cleanDomain.split('.');
    if (parts.length < 2) {
      return false;
    }
    
    // Check each part
    for (let part of parts) {
      if (part.length === 0 || part.length > 63) {
        return false;
      }
      
      // Must start and end with alphanumeric
      if (!/^[a-zA-Z0-9]/.test(part) || !/[a-zA-Z0-9]$/.test(part)) {
        return false;
      }
      
      // Can contain hyphens but not at start or end
      if (part.includes('-') && (part.startsWith('-') || part.endsWith('-'))) {
        return false;
      }
      
      // Only allow letters, numbers, and hyphens
      if (!/^[a-zA-Z0-9-]+$/.test(part)) {
        return false;
      }
    }
    
    // TLD must be at least 2 characters
    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
      return false;
    }
    
    return true;
  }
  
  if (!isValidDomain(cleanTarget)) {
    return new NextResponse('Invalid domain format', { status: 400 });
  }

  const script = `
(function() {
  'use strict';
  
  // Configuration - users can modify these values
  const TARGET_DOMAIN = '${target}';
  const ENABLE_REDIRECT = true; // Set to false to disable redirect functionality
  const DEBUG_MODE = ${debug};
  
  // Debug logging function
  function debugLog(message) {
    if (DEBUG_MODE) {
      console.log('[SmartRedirect Debug]', message);
    }
  }
  
  debugLog('Script loaded on: ' + window.location.href);
  debugLog('User Agent: ' + navigator.userAgent);
  
  // Don't run if redirect is disabled
  if (!ENABLE_REDIRECT) {
    debugLog('Redirect disabled by configuration');
    return;
  }
  
  // Check if we're already on the target domain
  const currentHostname = window.location.hostname;
  const targetHostname = TARGET_DOMAIN.replace(/^https?:\\/\\//, '');
  debugLog('Current hostname: ' + currentHostname);
  debugLog('Target hostname: ' + targetHostname);
  debugLog('Hostname comparison: "' + currentHostname + '" === "' + targetHostname + '" = ' + (currentHostname === targetHostname));
  
  // Also check if we're on a subdomain of the target
  const isOnTargetDomain = currentHostname === targetHostname || 
                          currentHostname.endsWith('.' + targetHostname) ||
                          targetHostname.endsWith('.' + currentHostname);
  
  debugLog('Is on target domain (including subdomains): ' + isOnTargetDomain);
  
  if (isOnTargetDomain) {
    debugLog('Already on target domain or subdomain, skipping redirect');
    return;
  }
  
  // Check if we're in a native browser or in-app browser
  const userAgent = navigator.userAgent.toLowerCase();
  debugLog('User agent (lowercase): ' + userAgent);
  
  const isNativeBrowser = 
    userAgent.includes("safari") && !userAgent.includes("chrome") || // Native Safari
    userAgent.includes("chrome") && !userAgent.includes("instagram") && !userAgent.includes("facebook") && !userAgent.includes("twitter") && !userAgent.includes("whatsapp") && !userAgent.includes("tiktok") && !userAgent.includes("snapchat") || // Native Chrome
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
  const targetUrl = TARGET_DOMAIN + currentPath;
  debugLog('Current path: ' + currentPath);
  debugLog('Target domain: ' + TARGET_DOMAIN);
  debugLog('Target URL: ' + targetUrl);
  debugLog('Full target URL length: ' + targetUrl.length);
  
  const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  debugLog('Is iOS: ' + isiOS);
  debugLog('Is Android: ' + isAndroid);
  
  // Function to show fallback UI
  function showFallbackUI(fallbackUrl) {
    debugLog('Showing fallback UI for: ' + fallbackUrl);
    
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
    debugLog('Fallback UI added to DOM');
  }
  
  // Function to attempt redirect
  function attemptRedirect() {
    debugLog('Attempting redirect...');
    
         if (isAndroid) {
       debugLog('Using Android redirect method');
       // Android: Try opening in Chrome via intent, fallback to normal redirect
       const cleanTargetUrl = targetUrl.replace(/^https?:\\/\\//, '');
       const intentUrl = 'intent://' + cleanTargetUrl + '#Intent;scheme=https;package=com.android.chrome;end;';
       debugLog('Clean target URL: ' + cleanTargetUrl);
       debugLog('Intent URL: ' + intentUrl);
       debugLog('About to set window.location.href to intent URL');
       window.location.href = intentUrl;
      
      // Fallback after a short delay
      setTimeout(() => {
        debugLog('Checking if redirect was successful...');
        if (window.location.href !== targetUrl) {
          debugLog('Redirect failed, showing fallback UI');
          showFallbackUI(targetUrl);
        } else {
          debugLog('Redirect successful');
        }
      }, 1500);
    } else if (isiOS) {
      debugLog('Using iOS redirect method');
      // iOS: Try multiple approaches
      let redirectAttempted = false;
      
      // Method 1: Try Safari-specific URL
      try {
        const safariUrl = 'x-safari-' + targetUrl;
        debugLog('Safari URL: ' + safariUrl);
        window.location.href = safariUrl;
        redirectAttempted = true;
        debugLog('Safari redirect attempted');
      } catch (e) {
        debugLog('Safari redirect failed: ' + e.message);
      }
      
      // Method 2: Try window.open
      setTimeout(() => {
        if (!redirectAttempted) {
          debugLog('Trying window.open method');
          const newWindow = window.open(targetUrl, '_self');
          if (!newWindow) {
            debugLog('window.open failed, showing fallback UI');
            showFallbackUI(targetUrl);
          } else {
            debugLog('window.open successful');
          }
        } else {
          // Check if we're still on the same page
          setTimeout(() => {
            debugLog('Checking if Safari redirect was successful...');
            if (window.location.href.indexOf(targetUrl) === -1) {
              debugLog('Safari redirect failed, showing fallback UI');
              showFallbackUI(targetUrl);
            } else {
              debugLog('Safari redirect successful');
            }
          }, 1000);
        }
      }, 100);
    } else {
      debugLog('Using default redirect method');
      // Default redirect for other platforms
      try {
        window.location.replace(targetUrl);
        debugLog('Default redirect executed');
      } catch (e) {
        debugLog('Default redirect failed: ' + e.message);
        showFallbackUI(targetUrl);
      }
    }
  }
  
  // Execute redirect
  debugLog('Starting redirect process...');
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
