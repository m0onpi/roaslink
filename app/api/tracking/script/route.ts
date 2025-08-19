import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache for validated domains to improve performance
const domainValidationCache = new Map<string, { isValid: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to extract domain from origin URL
function extractDomainFromOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    return url.hostname.replace(/^www\./, ''); // Remove www. prefix
  } catch {
    return '';
  }
}

// Check if domain is confirmed and paid for
async function isDomainValidForCors(origin: string): Promise<boolean> {
  if (!origin) return false;
  
  const domain = extractDomainFromOrigin(origin);
  if (!domain) return false;
  
  // Check cache first
  const cached = domainValidationCache.get(domain);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.isValid;
  }
  
  try {
    // Check database for domain with active user subscription
    const domainRecord = await prisma.domain.findFirst({
      where: {
        OR: [
          { domain: domain },
          { domain: `www.${domain}` } // Also check www variant
        ],
        isActive: true,
      },
      include: {
        user: {
          select: {
            subscriptionStatus: true,
            subscriptionEndsAt: true,
          }
        }
      }
    });
    
    const isValid = !!(
      domainRecord &&
      domainRecord.user.subscriptionStatus === 'active' &&
      domainRecord.user.subscriptionEndsAt &&
      new Date(domainRecord.user.subscriptionEndsAt) > new Date()
    );
    
    // Cache the result
    domainValidationCache.set(domain, {
      isValid,
      timestamp: Date.now()
    });
    
    return isValid;
  } catch (error) {
    console.error('Error validating domain for CORS:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const debug = searchParams.get('debug') === 'true';

  if (!domain) {
    return new NextResponse('Missing required parameter: domain', { status: 400 });
  }

  // Basic domain validation
  const cleanDomain = domain.replace(/^https?:\/\//, '');
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(cleanDomain)) {
    return new NextResponse('Invalid domain format', { status: 400 });
  }

  // Check if domain exists in database
  try {
    const domainRecord = await prisma.domain.findUnique({
      where: { domain: cleanDomain },
      select: { id: true, isActive: true },
    });

    if (!domainRecord) {
      return new NextResponse('Domain not found', { status: 404 });
    }

    if (!domainRecord.isActive) {
      return new NextResponse('Domain is not active', { status: 403 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }

  const script = `(function() {
  'use strict';
  
  const domain = '${cleanDomain}';
  const debugMode = ${debug};
  
  // Generate unique session ID
  function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  // Get or create session ID
  let sessionId = sessionStorage.getItem('smartdirect_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('smartdirect_session_id', sessionId);
  }
  
  // Debug logging function
  function debugLog(message, data) {
    if (debugMode) {
      console.log('[SmartDirect Tracking]', message, data || '');
    }
  }
  
  debugLog('Tracking script loaded', { domain, sessionId });
  
  // Track data to server - use RoasLink API
  function trackEvent(eventType, data = {}) {
    const payload = {
      sessionId: sessionId,
      domain: domain,
      eventType: eventType,
      page: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ...data
    };
    
    debugLog('Tracking event', payload);
    
    // Send to RoasLink tracking endpoint with enhanced error handling
    fetch('https://roaslink.co.uk/api/tracking/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true
    })
    .then(response => {
      debugLog('Tracking response received', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      return response.text();
    })
    .then(responseText => {
      debugLog('Tracking success', responseText);
    })
    .catch(error => {
      debugLog('Failed to send tracking data', {
        error: error.message,
        stack: error.stack,
        type: error.constructor.name
      });
      
      // Additional diagnostic fetch to test connectivity
      if (debugMode) {
        debugLog('Running diagnostic test...');
        fetch('https://roaslink.co.uk/api/tracking/diagnose', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        .then(r => r.json())
        .then(result => debugLog('Diagnostic test result', result))
        .catch(diagError => debugLog('Diagnostic test failed', diagError));
      }
    });
  }
  
  // Track page view
  function trackPageView() {
    trackEvent('page_view', {
      title: document.title,
      url: window.location.href
    });
  }
  
  // Track page exit
  function trackPageExit() {
    trackEvent('page_exit', {
      exitPage: window.location.pathname + window.location.search,
      timeOnPage: Date.now() - pageStartTime
    });
  }
  
  // Track clicks
  function trackClick(event) {
    const element = event.target;
    const selector = getElementSelector(element);
    
    trackEvent('click', {
      element: selector,
      elementType: element.tagName.toLowerCase(),
      elementText: element.textContent?.trim().substring(0, 100),
      elementId: element.id,
      elementClass: element.className
    });
  }
  
  // Track form submissions
  function trackFormSubmit(event) {
    const form = event.target;
    const formData = new FormData(form);
    const fields = [];
    
    for (let [key, value] of formData.entries()) {
      fields.push(key);
    }
    
    trackEvent('form_submit', {
      formId: form.id,
      formClass: form.className,
      formAction: form.action,
      fieldCount: fields.length,
      fields: fields
    });
  }
  
  // Track scroll depth
  let maxScrollDepth = 0;
  function trackScroll() {
    const scrollDepth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
    
    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;
      
      // Track milestone scroll depths
      if (scrollDepth >= 25 && scrollDepth < 50 && maxScrollDepth >= 25) {
        trackEvent('scroll', { depth: 25 });
      } else if (scrollDepth >= 50 && scrollDepth < 75 && maxScrollDepth >= 50) {
        trackEvent('scroll', { depth: 50 });
      } else if (scrollDepth >= 75 && scrollDepth < 90 && maxScrollDepth >= 75) {
        trackEvent('scroll', { depth: 75 });
      } else if (scrollDepth >= 90 && maxScrollDepth >= 90) {
        trackEvent('scroll', { depth: 90 });
      }
    }
  }
  
  // Get CSS selector for element
  function getElementSelector(element) {
    if (element.id) {
      return '#' + element.id;
    }
    
    if (element.className) {
      return '.' + element.className.split(' ')[0];
    }
    
    let selector = element.tagName.toLowerCase();
    let parent = element.parentElement;
    
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      if (index > 0) {
        selector += ':nth-child(' + (index + 1) + ')';
      }
    }
    
    return selector;
  }
  
  // Initialize tracking
  const pageStartTime = Date.now();
  
  // Track initial page view
  trackPageView();
  
  // Set up event listeners
  document.addEventListener('click', trackClick, true);
  document.addEventListener('submit', trackFormSubmit, true);
  
  // Throttled scroll tracking
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(trackScroll, 250);
  });
  
  // Track page exit events
  window.addEventListener('beforeunload', trackPageExit);
  window.addEventListener('pagehide', trackPageExit);
  
  // Track visibility changes (tab switching)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      trackEvent('page_hide');
    } else {
      trackEvent('page_show');
    }
  });
  
  // Track session end after inactivity
  let inactivityTimer;
  const inactivityTimeout = 30 * 60 * 1000; // 30 minutes
  
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      trackEvent('session_timeout');
    }, inactivityTimeout);
  }
  
  // Reset timer on user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });
  
  resetInactivityTimer();
  
  debugLog('Tracking initialized successfully');
  
})();`;

  // Helper function to get CORS headers for script route
  async function getScriptCorsHeaders(origin?: string | null) {
    let allowOrigin = '*'; // Default fallback
    
    if (origin) {
      const isValidDomain = await isDomainValidForCors(origin);
      if (isValidDomain) {
        allowOrigin = origin; // Allow the specific origin if domain is valid
      }
    }
    
    return {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }

  return new NextResponse(script, {
    headers: await getScriptCorsHeaders(request.headers.get('origin')),
  });
}
