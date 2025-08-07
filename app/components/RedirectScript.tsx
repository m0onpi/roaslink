'use client';

import { useEffect, useState } from "react";

interface RedirectScriptProps {
  targetDomain: string;
  fallbackUI?: boolean;
  customStyles?: React.CSSProperties;
}

const RedirectScript = ({ 
  targetDomain, 
  fallbackUI = true, 
  customStyles 
}: RedirectScriptProps) => {
  const [needsUserAction, setNeedsUserAction] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return; // Prevent SSR issues

    // Check if we're already on the target domain
    if (window.location.hostname === targetDomain.replace(/^https?:\/\//, '')) {
      return; // Don't redirect if already on the target domain
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
      return; // Don't redirect if in native browser
    }

    // Get current path and preserve it in the redirect
    const currentPath = window.location.pathname + window.location.search;
    const targetUrl = `${targetDomain}${currentPath}`;

    const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isAndroid) {
      // 🚀 Android: Try opening in Chrome via intent, fallback to normal redirect
      const intentUrl = `intent://${targetUrl.replace(/^https:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end;`;
      window.location.href = intentUrl;
      setTimeout(() => {
        window.location.href = targetUrl; // Fallback if intent fails
      }, 1000);
    } else if (isiOS) {
      // 🚀 iOS: Try to open in Safari
      const safariUrl = `x-safari-${targetUrl}`;
      window.location.href = safariUrl;
      
      setTimeout(() => {
        const newWindow = window.open(targetUrl, "_self");
        if (!newWindow) {
          setNeedsUserAction(true); // If blocked, show button
        }
      }, 50);
    } else {
      // 🚀 Default redirect for other platforms
      window.location.replace(targetUrl);
    }
  }, [targetDomain]);

  // Don't render anything if redirect is working
  if (!needsUserAction || !fallbackUI) {
    return null;
  }

  // Only show the fallback UI if automatic redirect failed
  const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
  const fallbackUrl = `${targetDomain}${currentPath}`;

  const defaultStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
    textAlign: "center",
    color: "white",
  };

  return (
    <div style={{ ...defaultStyles, ...customStyles }}>
      <p style={{ marginBottom: "20px", fontSize: "16px" }}>
        We couldn't open the link automatically. Please tap the button below to open it in your native browser.
      </p>
      <a
        href={fallbackUrl}
        style={{
          padding: "12px 24px",
          background: "#0070f3",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        Open in Native Browser
      </a>
    </div>
  );
};

export default RedirectScript;
