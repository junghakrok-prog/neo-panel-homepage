/* ㈜네오판넬 홈페이지 — 최소 스크립트: 모바일 메뉴 · 사진 크게 보기 */
(function(){
  var head=document.querySelector('.site-head'), mb=document.querySelector('.menu-btn');
  if(head&&mb){
    mb.addEventListener('click',function(){
      var o=head.classList.toggle('open');
      mb.setAttribute('aria-expanded',o?'true':'false');
      mb.setAttribute('aria-label',o?'메뉴 닫기':'메뉴 열기');
    });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&head.classList.contains('open')){head.classList.remove('open');mb.setAttribute('aria-expanded','false');mb.focus();} });
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
  dlg.innerHTML='<div class="lb-in"><span class="lb-count"></span><img alt=""><p class="lb-cap"></p>'+
    '<button type="button" class="x" aria-label="닫기">✕</button><button type="button" class="pv" aria-label="이전 사진">‹</button><button type="button" class="nx" aria-label="다음 사진">›</button></div>';
  document.body.appendChild(dlg);
  var im=dlg.querySelector('img'), cap=dlg.querySelector('.lb-cap'), cnt=dlg.querySelector('.lb-count'), cur=0;
  function show(i){
    cur=(i+links.length)%links.length; var a=links[cur], t=a.querySelector('img');
    im.src=a.getAttribute('href'); im.alt=t?t.alt:'';
    var c=a.getAttribute('data-cap')||''; cap.textContent=c; cnt.textContent=(cur+1)+' / '+links.length;
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
