import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';

  if (!target) {
    return new NextResponse('Missing target', { status: 400 });
  }

  // Server-side redirect logic - completely hidden from client
  const isNativeBrowser = 
    userAgent.toLowerCase().includes("safari") && !userAgent.toLowerCase().includes("chrome") ||
    userAgent.toLowerCase().includes("chrome") && !userAgent.toLowerCase().includes("instagram") && !userAgent.toLowerCase().includes("facebook") && !userAgent.toLowerCase().includes("twitter") ||
    userAgent.toLowerCase().includes("firefox") || 
    userAgent.toLowerCase().includes("edge") || 
    userAgent.toLowerCase().includes("opera");

  // If it's a native browser, redirect directly
  if (isNativeBrowser) {
    return NextResponse.redirect(target);
  }

  // For in-app browsers, return a minimal script that just redirects
  const minimalScript = `
(function(){
  var t='${target}';
  var p=window.location.pathname+window.location.search;
  var u=t+p;
  if(/Android/.test(navigator.userAgent)){
    var i='intent://'+u.replace(/^https?:\\/\\//,'')+'#Intent;scheme=https;package=com.android.chrome;end;';
    window.location.href=i;
    setTimeout(function(){window.location.href=u;},1000);
  }else if(/iPhone|iPad|iPod/.test(navigator.userAgent)){
    var s='x-safari-'+u;
    window.location.href=s;
    setTimeout(function(){
      var w=window.open(s,'_self');
      if(!w){
        var o=document.createElement('div');
        o.id='smartredirect-overlay';
        o.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;padding:20px;text-align:center;color:white;';
        o.innerHTML='<p style="margin-bottom:20px;font-size:16px;">We couldn\\'t open the link automatically. Please tap the button below to open it in Safari.</p><a href="'+u+'" style="padding:12px 24px;background:#0070f3;color:#fff;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">Open in Safari</a>';
        document.body.appendChild(o);
      }
    },50);
  }else{
    window.location.replace(u);
  }
})();`;

  return new NextResponse(minimalScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
