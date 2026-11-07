/* 도면 문의: 허용된 채널명/영상 ID만 저장·계측. 파일·개인정보·문의 본문은 분석 전송하지 않음. */
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else api.start(root);
})(typeof window!=='undefined'?window:this,function(){
  'use strict';
  var KEY='np_drawing_source_v1', TTL=30*24*60*60*1000;
  var LABELS={youtube:'유튜브',instagram:'인스타그램',naver:'네이버 검색',naver_blog:'네이버 블로그',google:'구글 검색',bing:'빙 검색',daum:'다음 검색',daangn:'당근',naver_clip:'네이버 클립',kakao:'카카오톡',sms:'문자',other:'기타 외부 유입',direct:'직접 방문·경로 확인 안 됨'};
  function source(value){
    var v=String(value||'').toLowerCase();
    var aliases={'youtube.com':'youtube','youtu.be':'youtube','instagram.com':'instagram','naver.com':'naver','m.search.naver.com':'naver','blog.naver.com':'naver_blog','m.blog.naver.com':'naver_blog','blog':'naver_blog','daangn.com':'daangn'};
    return Object.prototype.hasOwnProperty.call(LABELS,v)?v:(Object.prototype.hasOwnProperty.call(aliases,v)?aliases[v]:'');
  }
  function campaign(value){return /^[A-Za-z0-9_-]{11}$/.test(String(value||''))?String(value):'';}
  function refSource(ref,host){
    try{
      var u=new URL(ref); if(u.hostname===host||/^(www\.)?neo-panel\.com$/.test(u.hostname))return '';
      var h=u.hostname.toLowerCase();
      if(/(^|\.)youtube\.com$/.test(h)||h==='youtu.be')return 'youtube';
      if(/(^|\.)instagram\.com$/.test(h)||h==='l.instagram.com')return 'instagram';
      if(/(^|\.)blog\.naver\.com$/.test(h))return 'naver_blog';
      if(/(^|\.)naver\.com$/.test(h))return 'naver';
      if(/(^|\.)google\.[a-z.]+$/.test(h))return 'google';
      if(/(^|\.)bing\.com$/.test(h))return 'bing';
      if(/(^|\.)daum\.net$/.test(h))return 'daum';
      if(/(^|\.)daangn\.com$/.test(h))return 'daangn';
      return 'other';
    }catch(e){return '';}
  }
  function resolve(ctx,stored){
    var q=new URLSearchParams(ctx.search||''), alias=source(ctx.alias), tagged=source(q.get('utm_source'));
    var incoming=alias||tagged||refSource(ctx.referrer,ctx.hostname);
    if(incoming)return {source:incoming,campaign:campaign(q.get('v')||q.get('utm_campaign'))||(alias?'profile':''),at:ctx.now};
    if(stored&&source(stored.source)&&typeof stored.at==='number'&&stored.at<=ctx.now&&ctx.now-stored.at<TTL)return {source:source(stored.source),campaign:campaign(stored.campaign),at:stored.at};
    return {source:'direct',campaign:'',at:ctx.now};
  }
  function text(tag){return '판넬 자재견적 문의입니다.\n연락처: \n현장 지역: \n건물 용도: \n도면이나 현장 사진을 함께 보내드립니다.\n\n문의 경로: '+LABELS[tag.source]+(tag.campaign?' / '+tag.campaign:'');}
  function start(w){
    var d=w.document, saved=null, tag;
    try{saved=JSON.parse(w.localStorage.getItem(KEY)||'null');}catch(e){}
    tag=resolve({search:w.location.search,alias:d.body.getAttribute('data-inquiry-source'),referrer:d.referrer,hostname:w.location.hostname,now:Date.now()},saved);
    try{w.localStorage.setItem(KEY,JSON.stringify(tag));}catch(e){}
    function event(name,via,where){
      if(!/^(www\.)?neo-panel\.com$/.test(w.location.hostname))return;
      if(typeof w.gtag!=='function')return;
      w.gtag('event',name,{mode:'drawing',via:via||'view',where:[tag.source,tag.campaign||'unspecified',where||'quote'].join('|'),transport_type:'beacon'});
    }
    // Existing UTM forwarding keeps old first-entry semantics. The inquiry attribution
    // is separate: last attributable channel within 30 days; never overwrite it on internal navigation.
    var entry=d.querySelector('.nav');
    if(entry){var li=d.createElement('li');li.className='nav-drawing';var a=d.createElement('a');a.href='/quote.html';a.textContent='도면견적 문의';a.setAttribute('data-quote-entry','header');li.appendChild(a);entry.appendChild(li);}
    var menu=d.querySelector('.mp-cta');
    if(menu){var a=d.createElement('a');a.className='btn btn-primary';a.href='/quote.html';a.textContent='도면견적 문의';a.setAttribute('data-quote-entry','mobile_menu');menu.insertBefore(a,menu.firstChild);}
    var dock=d.querySelector('.dock');
    if(dock){var a=d.createElement('a');a.className='btn btn-primary';a.href='/quote.html';a.textContent='도면견적 문의';a.setAttribute('data-quote-entry','bottom_bar');dock.insertBefore(a,dock.firstChild);dock.classList.add('drawing-dock');}
    d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-quote-entry]');if(a)event('drawing_quote_entry','entry',a.getAttribute('data-quote-entry'));},true);
    var quote=d.querySelector('.quote-main'); if(!quote)return;
    var template=d.getElementById('inquiry-template'), email=d.getElementById('quote-email');
    if(template)template.value=text(tag);
    if(email)email.href='mailto:neo-panel@naver.com?subject='+encodeURIComponent('도면 자재견적 문의 ['+LABELS[tag.source]+']')+'&body='+encodeURIComponent(text(tag)+'\n\n※ 보내기 전에 PDF·캐드 도면 파일을 직접 첨부해 주세요.');
    event('drawing_quote_view','view','quote');
    d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-quote-contact]');if(a)event('drawing_quote_contact',a.getAttribute('data-quote-contact'),'quote');},true);
    function copy(id,value,kind){
      var b=d.getElementById(id);if(!b)return;
      b.addEventListener('click',function(){
        var feedback=d.getElementById('quote-feedback');
        if(!w.navigator.clipboard||!w.navigator.clipboard.writeText){if(template&&kind==='template'){template.parentElement.open=true;template.focus();template.select();}feedback.textContent='복사 기능을 사용할 수 없습니다. 화면의 내용을 직접 선택해 복사해 주세요.';return;}
        w.navigator.clipboard.writeText(value).then(function(){feedback.textContent=kind==='template'?'문의 내용을 복사했습니다. 카카오톡 상담창에 붙여 넣고 연락처·현장 지역을 적어 주세요.':'이메일 주소를 복사했습니다.';event('drawing_quote_copy',kind,'quote');},function(){if(template&&kind==='template'){template.parentElement.open=true;template.focus();template.select();}feedback.textContent='복사가 되지 않았습니다. 화면의 내용을 직접 선택해 복사해 주세요.';});
      });
    }
    copy('copy-email','neo-panel@naver.com','email');copy('copy-inquiry',text(tag),'template');
  }
  return {resolve:resolve,text:text,source:source,start:start};
});
