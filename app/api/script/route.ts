import { NextRequest, NextResponse } from 'next/server';

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

  const script = `(function() {
  'use strict';
  
  // Get domain from script tag data attribute or URL parameter
  const currentScript = document.currentScript;
  const domain = currentScript?.getAttribute('data-domain') || '${cleanDomain}';
  const debugMode = currentScript?.getAttribute('data-debug') === 'true' || ${debug};
  // Using pixel tracking - no CORS issues!
  
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
  
  debugLog('Tracking script loaded', { domain, sessionId, trackingMethod: 'pixel' });
  
  // Track data using pixel tracking (no CORS issues)
  function trackEvent(eventType, data = {}) {
    const params = new URLSearchParams({
      sessionId: sessionId,
      domain: domain,
      eventType: eventType,
      page: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      title: document.title,
      url: window.location.href,
      // Add event-specific data
      ...Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          \`data_\${key}\`, 
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        ])
      )
    });
    
    debugLog('Tracking event', { eventType, domain, data });
    
    // Use pixel tracking - no CORS issues!
    const trackingUrl = \`https://roaslink.co.uk/api/tracking/pixel?\${params.toString()}\`;
    debugLog('Sending pixel request to:', trackingUrl);
    
    // Create invisible 1x1 pixel image
    const pixel = new Image(1, 1);
    pixel.onload = function() {
      debugLog('Tracking pixel loaded successfully');
    };
    pixel.onerror = function() {
      debugLog('Tracking pixel failed to load');
    };
    
    // This triggers the GET request - no CORS restrictions!
    pixel.src = trackingUrl;
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
  
  // Track meaningful clicks only (for heatmap and user flow)
  function trackClick(event) {
    const element = event.target;
    const elementType = element.tagName.toLowerCase();
    
    // Only track meaningful interactions for heatmap
    const meaningfulElements = ['a', 'button', 'input', 'select', 'textarea'];
    const hasClickHandler = element.onclick || element.addEventListener;
    const isInteractive = meaningfulElements.includes(elementType) || 
                         element.getAttribute('role') === 'button' ||
                         element.closest('[onclick]') ||
                         hasClickHandler;
    
    if (!isInteractive) return; // Skip tracking non-interactive clicks
    
    const selector = getElementSelector(element);
    const rect = element.getBoundingClientRect();
    
    trackEvent('interaction', {
      element: selector,
      elementType: elementType,
      elementText: element.textContent?.trim().substring(0, 50),
      elementId: element.id,
      elementClass: element.className,
      // Viewport coordinates (better for heatmaps)
      viewportX: Math.round(rect.left + rect.width / 2),
      viewportY: Math.round(rect.top + rect.height / 2),
      // Click coordinates relative to element
      clickX: event.clientX - rect.left,
      clickY: event.clientY - rect.top,
      // Element dimensions
      elementWidth: rect.width,
      elementHeight: rect.height,
      // Page context
      scrollY: window.scrollY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
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
  
  // Track scroll depth and engagement
  let maxScrollDepth = 0;
  let scrollMilestones = {};
  
  function trackScroll() {
    const scrollDepth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
    
    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;
      
      // Track milestone scroll depths for engagement analysis
      const milestones = [25, 50, 75, 90];
      milestones.forEach(milestone => {
        if (scrollDepth >= milestone && !scrollMilestones[milestone]) {
          scrollMilestones[milestone] = true;
          trackEvent('scroll_milestone', { 
            depth: milestone,
            timeToReach: Date.now() - pageStartTime,
            scrollSpeed: 'normal' // Could calculate actual speed
          });
        }
      });
    }
  }
  
  // Track user engagement and potential exit points
  let lastActivity = Date.now();
  let engagementScore = 0;
  
  function trackEngagement() {
    engagementScore++;
    lastActivity = Date.now();
  }
  
  // Track when user might be leaving (idle detection)
  let idleTimer;
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    trackEngagement();
    
    idleTimer = setTimeout(() => {
      // User has been idle for 30 seconds - potential exit point
      trackEvent('potential_exit', {
        timeOnPage: Date.now() - pageStartTime,
        engagementScore: engagementScore,
        maxScrollDepth: maxScrollDepth,
        lastActiveElement: document.activeElement?.tagName?.toLowerCase() || 'unknown'
      });
    }, 30000); // 30 seconds
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }
  
  // Conversion tracking (customize these selectors for each customer)
  function trackConversions() {
    // Common conversion indicators - can be customized per domain
    const conversionSelectors = [
      '.checkout-complete',
      '.order-confirmation',
      '.thank-you',
      '.purchase-success',
      '#order-complete',
      '[data-conversion]'
    ];
    
    conversionSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        trackEvent('conversion', {
          type: 'purchase',
          selector: selector,
          conversionPage: window.location.pathname,
          timeToConvert: Date.now() - pageStartTime
        });
      }
    });
    
    // Check URL patterns for conversions
    const conversionUrls = [
      '/thank-you',
      '/order-complete',
      '/purchase-success',
      '/checkout/success'
    ];
    
    const currentPath = window.location.pathname.toLowerCase();
    conversionUrls.forEach(url => {
      if (currentPath.includes(url.toLowerCase())) {
        trackEvent('conversion', {
          type: 'purchase',
          urlPattern: url,
          conversionPage: currentPath,
          timeToConvert: Date.now() - pageStartTime
        });
      }
    });
  }
  
  // Set up event listeners with engagement tracking
  document.addEventListener('click', trackClick, true);
  document.addEventListener('submit', trackFormSubmit, true);
  
  // Throttled scroll tracking
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(trackScroll, 250);
  });
  
  // Track page exit events with engagement data
  function trackEngagedExit() {
    trackEvent('page_exit', {
      exitPage: window.location.pathname + window.location.search,
      timeOnPage: Date.now() - pageStartTime,
      engagementScore: engagementScore,
      maxScrollDepth: maxScrollDepth,
      scrollMilestones: Object.keys(scrollMilestones).map(Number),
      exitType: 'navigation'
    });
  }
  
  window.addEventListener('beforeunload', trackEngagedExit);
  window.addEventListener('pagehide', trackEngagedExit);
  
  // Track user engagement activities
  ['mousedown', 'mousemove', 'keypress', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetIdleTimer, true);
  });
  
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
  
  // Check for conversions after page load
  setTimeout(trackConversions, 1000); // Wait 1 second for page to fully load
  
  debugLog('Tracking initialized successfully');
  
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
