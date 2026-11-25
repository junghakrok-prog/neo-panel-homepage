/* 방화문 모델 갤러리 — 종류별 필터 및 모델명·색상·무늬 실시간 검색 */
(function(){
  var root=document.getElementById('fd-gallery'); if(!root)return;
  var tabs=[].slice.call(root.querySelectorAll('.fd-tab'));
  var input=document.getElementById('fd-search');
  var reset=document.getElementById('fd-reset');
  var status=document.getElementById('fd-status');
  var empty=document.getElementById('fd-empty');
  var secs=[].slice.call(document.querySelectorAll('.fd-cat-sec'));
  var curCat='all';
  function norm(s){ return (s||'').toLowerCase().replace(/[\s\-_]+/g,''); }
  function apply(){
    var raw=input?input.value.trim():'', q=norm(raw), shown=0;
    secs.forEach(function(sec){
      var sc=sec.getAttribute('data-cat');
      var cards=[].slice.call(sec.querySelectorAll('.fd-card')), secShown=0;
      cards.forEach(function(card){
        var ok=(curCat==='all'||curCat===sc)&&(!q||norm(card.getAttribute('data-q')).indexOf(q)>=0);
        card.hidden=!ok;
        if(ok){secShown++;shown++;}
      });
      sec.hidden=(secShown===0);
    });
    if(status){
      status.textContent=(curCat==='all'&&!raw)?('전체 159개 모델 표시 중'):('검색·분류 결과 '+shown+'개 모델 표시 중');
    }
    if(empty) empty.hidden=(shown>0);
    if(reset) reset.hidden=(curCat==='all'&&!raw);
  }
  tabs.forEach(function(btn){
    btn.addEventListener('click',function(){
      curCat=btn.getAttribute('data-filter')||'all';
      tabs.forEach(function(b){ b.setAttribute('aria-pressed',b===btn?'true':'false'); });
      apply();
    });
  });
  if(input) input.addEventListener('input',apply);
  if(reset) reset.addEventListener('click',function(){
    curCat='all';
    if(input) input.value='';
    tabs.forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-filter')==='all'?'true':'false'); });
    apply();
  });
})();
