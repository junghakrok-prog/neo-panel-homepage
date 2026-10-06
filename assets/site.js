/* ㈜네오판넬 홈페이지 — 최소 스크립트: 출처 꼬리표 넘기기 · 모바일 메뉴 · 사진 크게 보기 */

/* 출처 꼬리표 넘기기(사장님 2026-10-06 QR·당근·거래처 카톡 홍보) — QR·당근 등으로 들어온 주소의
   utm_source·utm_medium·utm_campaign 을 이 탭의 sessionStorage 에 기억해 두고(처음 들어온 값 우선),
   쪽 안의 판넬견적3D 웹 링크와 구글 플레이 링크에 그대로 붙인다 → 앱 GA4 에서 '어느 QR·채널로 왔는지'가 잡힌다.
   · 꼬리표 없이 들어오면 아무 링크도 바꾸지 않는다(기존 '홈페이지 유입' 집계 그대로).
   · 앱 개인정보처리방침(privacy.html)·앱스토어 링크는 건드리지 않는다. 이미 꼬리표·referrer 가 있는 링크도 그대로 둔다
     (단 app.html 플레이 버튼의 기본 referrer=utm_source=homepage 는 채널 값으로 바꾼다).
   · 외부로 보내는 것 없음, 개인정보 없음. 여기서 오류가 나도 아래 다른 기능은 그대로 돈다.
   · 맨 앞에 두는 이유: 아래 블록이 오류로 멈춰도 이 블록은 먼저 끝나 있게. */
(function(){
  try{
    var KEYS=['utm_source','utm_medium','utm_campaign'], SK='np_utm', APP_HOST='junghakrok-prog.github.io', PLAY_ID='com.neopanel.quote3d';
    function clean(v){ v=String(v==null?'':v).replace(/[\u0000-\u001f\u007f]/g,'').trim(); return v.length>100?v.slice(0,100):v; }
    function fromUrl(){
      var q=new URLSearchParams(location.search), t={}, n=0;
      KEYS.forEach(function(k){ var v=clean(q.get(k)); if(v){ t[k]=v; n++; } });
      return n&&t.utm_source?t:null;
    }
    var tag=null;
    try{ var s=sessionStorage.getItem(SK); if(s){ var p=JSON.parse(s); if(p&&typeof p.utm_source==='string'&&p.utm_source)tag=p; } }catch(e){}
    if(!tag){ tag=fromUrl(); if(tag){ try{ sessionStorage.setItem(SK,JSON.stringify(tag)); }catch(e){} } }
    if(!tag)return;
    var pairs=[]; KEYS.forEach(function(k){ var v=clean(tag[k]); if(v)pairs.push(k+'='+encodeURIComponent(v)); });
    if(!pairs.length)return;
    function addQuery(href,extra){ var i=href.indexOf('#'), base=i<0?href:href.slice(0,i), hash=i<0?'':href.slice(i); return base+(base.indexOf('?')<0?'?':(/[?&]$/.test(base)?'':'&'))+extra+hash; }
    [].slice.call(document.querySelectorAll('a[href]')).forEach(function(a){
      try{
        var raw=a.getAttribute('href'), u=new URL(raw,location.href);
        if(u.protocol!=='https:'&&u.protocol!=='http:')return;
        if(u.hostname===APP_HOST){
          if(/\/privacy\.html$/i.test(u.pathname))return;
          if(/(^|[?&])utm_[a-z]+=/i.test(u.search))return;
          a.setAttribute('href',addQuery(raw,pairs.join('&')));
        }else if(u.hostname==='play.google.com'&&u.pathname==='/store/apps/details'&&u.searchParams.get('id')===PLAY_ID){
          var ref='referrer='+encodeURIComponent(pairs.join('&'));
          /* app.html 의 기본 꼬리표(referrer=utm_source=homepage)만 채널 값으로 바꾼다 — QR·당근으로 온 손님이 '홈페이지'로 섞이지 않게.
             그 밖의 referrer 는 그대로 둔다. */
          if(u.searchParams.get('referrer')==='utm_source=homepage'){ a.setAttribute('href',raw.replace(/([?&])referrer=utm_source%3Dhomepage(?=&|#|$)/i,'$1'+ref)); return; }
          if(u.searchParams.has('referrer'))return;
          a.setAttribute('href',addQuery(raw,ref));
        }
      }catch(e){}
    });
  }catch(e){}
})();

(function(){
  var head=document.querySelector('.site-head'), mb=document.querySelector('.menu-btn');
  if(head&&mb){
    mb.addEventListener('click',function(){
      var o=head.classList.toggle('open');
      mb.setAttribute('aria-expanded',o?'true':'false');
      mb.setAttribute('aria-label',o?'메뉴 닫기':'메뉴 열기');
    });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&head.classList.contains('open')){head.classList.remove('open');mb.setAttribute('aria-expanded','false');mb.setAttribute('aria-label','메뉴 열기');mb.focus();} });
  }
  /* 옆으로 밀리는 메뉴 줄 — 지금 쪽 단추를 보이게 당겨 오고, 뒤에 더 있으면 오른쪽을 흐리게(더 있음 힌트) */
  [].slice.call(document.querySelectorAll('.subnav ul,.jump')).forEach(function(el){
    var cur=el.querySelector('[aria-current="page"]');
    if(cur){var a=cur.getBoundingClientRect(),b=el.getBoundingClientRect(); if(a.right>b.right-8)el.scrollLeft+=a.left-b.left-(el.clientWidth-a.width)/2;}
    function hint(){el.classList.toggle('more-r',el.scrollWidth>el.clientWidth+2&&el.scrollLeft+el.clientWidth<el.scrollWidth-24);}
    hint(); el.addEventListener('scroll',hint,{passive:true}); window.addEventListener('resize',hint);
  });
  /* 사진 크게 보기 — 링크(.zoom)만으로도 원본이 열리고, 스크립트가 있으면 같은 화면에서 넘겨 본다 */
  var links=[].slice.call(document.querySelectorAll('a.zoom'));
  if(!links.length||typeof HTMLDialogElement==='undefined')return;
  var dlg=document.createElement('dialog'); dlg.className='lb'; dlg.setAttribute('aria-label','사진 크게 보기');
  dlg.innerHTML='<div class="lb-in"><span class="lb-count" aria-live="polite"></span><a class="lb-original" target="_blank" rel="noopener">원본 열기 ↗</a><img alt=""><p class="lb-cap"></p>'+
    '<button type="button" class="x" aria-label="닫기">✕</button><button type="button" class="pv" aria-label="이전 사진">‹</button><button type="button" class="nx" aria-label="다음 사진">›</button></div>';
  document.body.appendChild(dlg);
  var im=dlg.querySelector('img'), cap=dlg.querySelector('.lb-cap'), cnt=dlg.querySelector('.lb-count'), cur=0;
  function show(i){
    cur=(i+links.length)%links.length; var a=links[cur], t=a.querySelector('img');
    im.src=a.getAttribute('href'); im.alt=t?t.alt:''; dlg.querySelector('.lb-original').href=a.getAttribute('href');
    var c=(a.getAttribute('data-cap')||'').trim()||(t?t.alt:'')||'제품 사진'; cap.textContent=c; cnt.textContent=(cur+1)+' / '+links.length;
  }
  links.forEach(function(a,i){ a.addEventListener('click',function(e){ if(e.ctrlKey||e.metaKey||e.shiftKey)return; e.preventDefault(); show(i); dlg.showModal(); }); });
  dlg.querySelector('.x').addEventListener('click',function(){dlg.close();});
  dlg.querySelector('.pv').addEventListener('click',function(e){e.stopPropagation();show(cur-1);});
  dlg.querySelector('.nx').addEventListener('click',function(e){e.stopPropagation();show(cur+1);});
  dlg.addEventListener('click',function(e){ if(e.target===dlg||e.target.classList.contains('lb-in'))dlg.close(); });
  dlg.addEventListener('keydown',function(e){ if(e.key==='ArrowLeft')show(cur-1); if(e.key==='ArrowRight')show(cur+1); });
  var sx=null; dlg.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
  dlg.addEventListener('touchend',function(e){ if(sx===null)return; var dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>50)show(cur+(dx<0?1:-1)); sx=null; });
})();

/* 제품 목록 검색: 제품명·분류만 검색하며 서버 전송이나 저장은 하지 않는다. */
(function(){
  var finder=document.querySelector('.product-finder'), input=document.getElementById('product-search');
  if(!finder||!input)return;
  var reset=document.getElementById('product-search-reset'), status=document.getElementById('product-search-status');
  var empty=document.querySelector('.product-search-empty'), sections=[].slice.call(document.querySelectorAll('#product-results .hub-cat'));
  var items=[], timer, composing=false;
  function normalize(value){return value.toLowerCase().replace(/판넬/g,'패널').replace(/[\s\-_\/·]+/g,'');}
  sections.forEach(function(section){
    var category=section.querySelector('h2').textContent;
    [].slice.call(section.querySelectorAll('.hub-item')).forEach(function(link){
      items.push({link:link,section:section,text:normalize(category+' '+link.querySelector('b').textContent)});
    });
  });
  function filter(){
    clearTimeout(timer);
    var query=input.value.trim(), words=query.split(/\s+/).filter(Boolean).map(normalize), count=0;
    items.forEach(function(item){var match=words.every(function(word){return item.text.indexOf(word)!==-1;});item.link.hidden=!match;if(match)count++;});
    sections.forEach(function(section){section.hidden=!items.some(function(item){return item.section===section&&!item.link.hidden;});});
    empty.hidden=count!==0;
    status.textContent=query?'“'+query+'” 검색 결과 '+count+'개':'전체 '+items.length+'개 항목';
  }
  function clearSearch(){input.value='';filter();}
  input.addEventListener('compositionstart',function(){composing=true;clearTimeout(timer);});
  input.addEventListener('compositionend',function(){composing=false;filter();});
  input.addEventListener('input',function(){if(!composing){clearTimeout(timer);timer=setTimeout(filter,180);}});
  input.addEventListener('search',filter);
  input.addEventListener('keydown',function(event){if(event.key==='Enter'&&!composing){event.preventDefault();filter();}});
  reset.addEventListener('click',function(){clearSearch();input.focus();});
  [].slice.call(document.querySelectorAll('.catalog-jump a')).forEach(function(link){link.addEventListener('click',clearSearch);});
  window.addEventListener('hashchange',function(){var section=sections.filter(function(el){return '#'+el.id===location.hash;})[0];if(section&&section.hidden)clearSearch();});
  finder.hidden=false;filter();
})();

/* 시공사례 유형별 탐색 — 자바스크립트가 없으면 전체 사진을 표시 */
(function(){
 var bar=document.querySelector('.case-filter'); if(!bar)return;
 var cards=[].slice.call(document.querySelectorAll('.case-index .case'));
 var buttons=[].slice.call(bar.querySelectorAll('button[data-case-filter]'));
 var status=document.getElementById('case-filter-status');
 buttons.forEach(function(button){button.addEventListener('click',function(){
  var key=button.getAttribute('data-case-filter'), count=0;
  cards.forEach(function(card){var match=key==='all'||card.getAttribute('data-case-tags').split(' ').indexOf(key)!==-1; card.hidden=!match;if(match)count++;});
  buttons.forEach(function(b){b.setAttribute('aria-pressed',b===button?'true':'false');});
  status.textContent=button.textContent+' '+count+'건';
 });});
 bar.hidden=false;
})();

/* 방문자 수(사장님 09-30 "홈페이지에 방문자수 카운트 넣자 일일·주별·월간") — 파이어베이스 siteStats 에 익명 숫자만 쌓는다.
   같은 사람은 날·주·달마다 한 번만 센다(이 브라우저의 localStorage 표시). 이름·연락처·IP 등 개인정보는 보내지 않는다.
   DB 규칙이 아직 없거나 막히면 조용히 숨긴다(화면 깨짐 없음). 한국 시간 기준, 주 = 월~일. */
(function () {
  var box = document.getElementById('np-visits'); if (!box || !window.fetch) return;
  var P = 'neopanel-app', KEY = 'AIzaSyCpJEeFn-CAaIkF5-lRc6ADsJfx3SJ3_p4';
  var BASE = 'https://firestore.googleapis.com/v1/projects/' + P + '/databases/(default)/documents';
  var kst = new Date(Date.now() + 9 * 3600e3), y = kst.getUTCFullYear(), mo = kst.getUTCMonth() + 1, da = kst.getUTCDate();
  function z(n) { return (n < 10 ? '0' : '') + n; }
  var dow = (kst.getUTCDay() + 6) % 7, mon = new Date(Date.UTC(y, mo - 1, da - dow));
  var ids = { d: 'd_' + y + '-' + z(mo) + '-' + z(da), w: 'w_' + mon.getUTCFullYear() + '-' + z(mon.getUTCMonth() + 1) + '-' + z(mon.getUTCDate()), m: 'm_' + y + '-' + z(mo) };
  function seen(k) { try { var v = localStorage.getItem('np_v_' + k) === ids[k]; if (!v) localStorage.setItem('np_v_' + k, ids[k]); return v; } catch (e) { return true; } }
  var writes = [];
  ['d', 'w', 'm'].forEach(function (k) {
    if (!seen(k)) writes.push({ update: { name: 'projects/' + P + '/databases/(default)/documents/siteStats/' + ids[k], fields: {} }, updateMask: { fieldPaths: [] }, updateTransforms: [{ fieldPath: 'c', increment: { integerValue: '1' } }] });
  });
  var go = writes.length ? fetch(BASE + ':commit?key=' + KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ writes: writes }) }).catch(function () {}) : Promise.resolve();
  go.then(function () {
    return fetch(BASE + ':batchGet?key=' + KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documents: ['d', 'w', 'm'].map(function (k) { return 'projects/' + P + '/databases/(default)/documents/siteStats/' + ids[k]; }) }) });
  }).then(function (r) { return r && r.ok ? r.json() : null; }).then(function (arr) {
    if (!arr) return; var got = 0;
    arr.forEach(function (x) { if (!x.found) return; var id = x.found.name.split('/').pop(), k = id.charAt(0), c = +((x.found.fields || {}).c || {}).integerValue || 0; var el = box.querySelector('[data-k="' + k + '"]'); if (el) { el.textContent = c.toLocaleString('ko-KR'); got++; } });
    if (got) box.hidden = false;
  }).catch(function () {});
})();

/* 최상단 '홈 화면에 추가 / 즐겨찾기 추가' 띠 (사장님 2026-10-06)
   - 폰: 안드로이드 크롬·삼성인터넷은 설치 창을 바로 띄움, 아이폰·네이버앱 등은 방법 안내
   - 컴퓨터: 즐겨찾기(Ctrl+D / ⌘+D) 안내 + 크롬·엣지면 바탕화면 바로가기(앱) 만들기
   - 이미 홈 화면에서 연 경우·닫기 누른 뒤 30일은 안 보임 */
(function () {
  try { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {}); } catch (e) {}
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone;
  if (standalone) return;
  var KEY = 'np-a2hs-hide';
  try { var t = +localStorage.getItem(KEY) || 0; if (t && Date.now() - t < 30 * 864e5) return; } catch (e) {}
  var ua = navigator.userAgent || '';
  var mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  var ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  var mac = /Mac/i.test(navigator.platform || ua);
  var deferred = null;
  var css = document.createElement('style');
  css.textContent = '.a2hs{background:#172631;color:#fff;font-size:16px;line-height:1.4}' +
    '.a2hs .in{max-width:1180px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:10px}' +
    '.a2hs .ic{width:36px;height:36px;border-radius:9px;flex:none}' +
    '.a2hs .tx{flex:1;min-width:0;color:#fff}.a2hs .tx b{display:block;font-size:17px;color:#fff !important}.a2hs .tx span{display:block;font-size:14px;color:#dfe6ec !important}.a2hs .tip{color:#fff}' +
    '.a2hs .go{background:#e67e22;color:#fff;border:0;border-radius:10px;padding:0 18px;min-height:48px;font-size:17px;font-weight:800;cursor:pointer;white-space:nowrap}' +
    '.a2hs .x{background:none;border:0;color:#fff;opacity:.8;font-size:26px;min-width:44px;min-height:44px;cursor:pointer}' +
    '.a2hs .tip{max-width:1180px;margin:0 auto;padding:0 16px 12px;font-size:16px;line-height:1.6}' +
    '.a2hs .tip b{color:#ffb36b}';
  document.head.appendChild(css);
  var bar = document.createElement('div');
  bar.className = 'a2hs'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', mobile ? '홈 화면에 추가' : '즐겨찾기 추가');
  bar.innerHTML = '<div class="in"><img class="ic" src="/img/brand/icon-96.png" alt="">' +
    '<div class="tx"><b>' + (mobile ? '홈 화면에 추가' : '네오판넬 즐겨찾기 추가') + '</b><span>' +
    (mobile ? '아이콘 한 번으로 바로 열려요' : '다음부터 한 번에 들어오세요') + '</span></div>' +
    '<button type="button" class="go">' + (mobile ? '추가하기' : '⭐ 추가하기') + '</button>' +
    '<button type="button" class="x" aria-label="닫기">×</button></div><div class="tip" hidden></div>';
  document.body.insertBefore(bar, document.body.firstChild);
  var tip = bar.querySelector('.tip');
  function show(h) { tip.innerHTML = h; tip.hidden = false; }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; if (/[?&]a2hs=1/.test(location.search)) show('<b>「추가하기」</b>를 누르시면 바로 홈 화면에 설치됩니다.'); });
  if (/[?&]a2hs=1/.test(location.search)) { try { localStorage.removeItem(KEY); } catch (e) {} }
  window.addEventListener('appinstalled', function () { bar.remove(); });
  bar.querySelector('.x').addEventListener('click', function () { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} bar.remove(); });
  bar.querySelector('.go').addEventListener('click', function () {
    if (deferred && mobile) { deferred.prompt(); deferred.userChoice.then(function (c) { if (c && c.outcome === 'accepted') bar.remove(); deferred = null; }); return; }
    if (mobile) {
      // 안드로이드인데 이 브라우저(네이버·카톡 등)가 설치를 지원하지 않으면 → 크롬으로 바로 열어 설치 창을 띄운다
      var android = /Android/i.test(ua), chromeLike = /Chrome\//.test(ua) && !/NAVER|KAKAOTALK|; wv\)|Instagram|FBAN|FBAV/i.test(ua);
      if (android && !chromeLike && !/SamsungBrowser/i.test(ua)) {
        var u = location.href.replace(/^https?:\/\//, '').split('#')[0];
        u += (u.indexOf('?') < 0 ? '?' : '&') + 'a2hs=1';
        location.href = 'intent://' + u + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(location.href) + ';end';
        show('크롬에서 열립니다. 크롬에서 <b>「추가하기」</b>를 한 번 더 누르시면 바로 설치됩니다.');
        return;
      }
      if (ios) show('아래쪽(또는 위쪽) <b>공유 버튼 ⬆︎</b>을 누르고 → <b>「홈 화면에 추가」</b>를 누르세요.');
      else if (/NAVER/i.test(ua)) show('오른쪽 아래 <b>메뉴(≡)</b> → <b>「홈 화면에 추가」</b>를 누르세요.');
      else if (/KAKAOTALK/i.test(ua)) show('오른쪽 위 <b>⋮</b> → <b>「다른 브라우저로 열기」</b>로 연 뒤, 메뉴에서 <b>「홈 화면에 추가」</b>를 누르세요.');
      else show('잠시 뒤 다시 눌러 주세요. 계속 안 되면 오른쪽 위 <b>⋮</b> → <b>「홈 화면에 추가」</b>를 누르세요.');
    } else {
      show('키보드에서 <b>' + (mac ? '⌘ + D' : 'Ctrl + D') + '</b>를 함께 누르면 즐겨찾기에 추가됩니다.' +
        (deferred ? ' <button type="button" class="go" style="margin-left:8px;min-height:40px">🖥 바탕화면 아이콘 만들기</button>' :
         (/Chrome|Edg/i.test(ua) ? ' 바탕화면 아이콘을 원하시면 주소창 오른쪽 <b>설치(⊕) 아이콘</b>을 누르세요.' : '')));
      var b2 = tip.querySelector('.go');
      if (b2) b2.addEventListener('click', function () { deferred.prompt(); deferred.userChoice.then(function () { deferred = null; }); });
    }
  });
})();
