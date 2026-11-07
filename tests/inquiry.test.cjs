const test=require('node:test');
const assert=require('node:assert/strict');
const api=require('../assets/inquiry.js');
const now=Date.now(),ctx={hostname:'www.neo-panel.com',now};
test('channel links survive internal navigation and expire after 30 days',()=>{
 const yt=api.resolve({...ctx,alias:'youtube',search:'?v=vLPUiyyZn1c'},null);
 assert.equal(yt.source,'youtube');assert.equal(yt.campaign,'vLPUiyyZn1c');
 assert.deepEqual(api.resolve({...ctx,referrer:'https://www.neo-panel.com/products.html'},yt),yt);
 assert.equal(api.resolve({...ctx,alias:'instagram'},yt).source,'instagram');
 assert.equal(api.resolve({...ctx},{...yt,at:now-31*86400000}).source,'direct');
 assert.equal(api.resolve({...ctx},{...yt,at:now+86400000}).source,'direct');
 assert(api.text(yt).includes('유튜브 / vLPUiyyZn1c'));
});
test('search and referring channels are separated without retaining raw URLs',()=>{
 for(const [url,s] of [['https://m.youtube.com/watch?v=a','youtube'],['https://l.instagram.com/?u=private','instagram'],['https://m.blog.naver.com/a','naver_blog'],['https://m.search.naver.com/search?q=private','naver'],['https://www.google.com/search?q=private','google'],['https://evil.example/?name=private','other']]){
  const value=api.resolve({...ctx,referrer:url},null);assert.equal(value.source,s);assert(!JSON.stringify(value).includes('private'));
 }
});
test('unknown tracking values and malformed storage cannot inject inquiry text',()=>{
 for(const source of ['01012345678','<script>alert(1)</script>','__proto__'])assert.equal(api.resolve({...ctx,search:'?utm_source='+encodeURIComponent(source)},null).source,'direct');
 assert.equal(api.resolve({...ctx,alias:'youtube',search:'?v=person%40mail.com'},null).campaign,'profile');
 assert.equal(api.resolve({...ctx},{source:'arbitrary-name',at:now}).source,'direct');
});
test('local preview and production events use separate paths; analytics contains no inquiry body',()=>{
 function fixture(host){
  const attrs={},events=[],callbacks={};
  const email={set href(v){attrs.email=v}},template={value:''};
  const body={getAttribute:()=> 'instagram'};
  const d={body,referrer:'',querySelector:s=>s==='.quote-main'?{}:null,getElementById:id=>id==='quote-email'?email:id==='inquiry-template'?template:null,addEventListener:(k,fn)=>{(callbacks[k]??=[]).push(fn)}};
  const w={document:d,location:{hostname:host,search:''},localStorage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}},gtag:(...a)=>events.push(a),navigator:{}};
  api.start(w);
  const target={closest:s=>s==='[data-quote-contact]'?{getAttribute:()=> 'email'}:null};
  callbacks.click.forEach(f=>f({target}));
  return{attrs,template,events};
 }
 assert.equal(fixture('localhost').events.length,0);
 const {attrs,template,events}=fixture('www.neo-panel.com');
 assert(decodeURIComponent(attrs.email).includes('문의 경로: 인스타그램'));
 assert(template.value.includes('인스타그램'));
 assert.deepEqual(events.map(x=>x[1]),['drawing_quote_view','drawing_quote_contact']);
 assert.equal(events[1][2].via,'email');
 assert(!JSON.stringify(events).includes('연락처'));
 assert(!JSON.stringify(events).includes('neo-panel@naver.com'));
});
