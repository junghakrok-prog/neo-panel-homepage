/* ㈜네오판넬 홈페이지 — 최소 스크립트: 모바일 메뉴 · 사진 크게 보기 */
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
