import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');

  if (!target) {
    return new NextResponse('Missing target', { status: 400 });
  }

  // Heavily obfuscated script that's impossible to read
  const script = `(function(){'use strict';var _0x2f1d=['href','replace','toLowerCase','includes','userAgent','location','pathname','search','open','_self','body','appendChild','createElement','div','id','smartredirect-overlay','style','cssText','position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;padding:20px;text-align:center;color:white;','innerHTML','<p style="margin-bottom:20px;font-size:16px;">We couldn\\'t open the link automatically. Please tap the button below to open it in Safari.</p><a href="','" style="padding:12px 24px;background:#0070f3;color:#fff;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">Open in Safari</a>','getElementById','intent://','#Intent;scheme=https;package=com.android.chrome;end;','x-safari-','setTimeout','replace','hostname','replace','setTimeout','open','opener','true','replace'];var _0x4a2b=function(_0x2f1d){return _0x2f1d;};var _0x5c3d=_0x4a2b;var _0x6e4f='${target}';var _0x7f5g=_0x6e4f[_0x5c3d(1)]();var _0x8g6h=window[_0x5c3d(5)][_0x5c3d(4)];if(_0x8g6h===_0x7f5g){return;}var _0x9i7j=navigator[_0x5c3d(4)][_0x5c3d(3)]();var _0xa0k8=_0x9i7j[_0x5c3d(3)]('safari')&&!_0x9i7j[_0x5c3d(3)]('chrome')||_0x9i7j[_0x5c3d(3)]('chrome')&&!_0x9i7j[_0x5c3d(3)]('instagram')&&!_0x9i7j[_0x5c3d(3)]('facebook')&&!_0x9i7j[_0x5c3d(3)]('twitter')||_0x9i7j[_0x5c3d(3)]('firefox')||_0x9i7j[_0x5c3d(3)]('edge')||_0x9i7j[_0x5c3d(3)]('opera');if(_0xa0k8){return;}var _0xb1l9=window[_0x5c3d(5)][_0x5c3d(6)]+window[_0x5c3d(5)][_0x5c3d(7)];var _0xc2m0=_0x6e4f+_0xb1l9;var _0xd3n1=/iPhone|iPad|iPod/.test(navigator[_0x5c3d(4)]);var _0xe4o2=/Android/.test(navigator[_0x5c3d(4)]);function _0xf5p3(){if(document[_0x5c3d(12)](_0x5c3d(15))){return;}var _0x10q4=document[_0x5c3d(13)](_0x5c3d(14));_0x10q4[_0x5c3d(16)]=_0x5c3d(15);_0x10q4[_0x5c3d(17)][_0x5c3d(18)]=_0x5c3d(19);_0x10q4[_0x5c3d(20)]=_0x5c3d(21)+_0xc2m0+_0x5c3d(22);document[_0x5c3d(11)][_0x5c3d(12)](_0x10q4);}if(_0xe4o2){var _0x11r5=_0x5c3d(23)+_0xc2m0[_0x5c3d(1)]()+_0x5c3d(24);window[_0x5c3d(5)][_0x5c3d(0)]=_0x11r5;window[_0x5c3d(25)](function(){window[_0x5c3d(5)][_0x5c3d(0)]=_0xc2m0;},1000);}else if(_0xd3n1){var _0x12s6=_0x5c3d(26)+_0xc2m0;window[_0x5c3d(5)][_0x5c3d(0)]=_0x12s6;window[_0x5c3d(25)](function(){var _0x13t7=window[_0x5c3d(8)](_0x12s6,_0x5c3d(9));if(!_0x13t7){_0xf5p3();}else{_0x13t7[_0x5c3d(27)]=_0x5c3d(28);}},50);}else{window[_0x5c3d(5)][_0x5c3d(29)](_0xc2m0);}})();`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
