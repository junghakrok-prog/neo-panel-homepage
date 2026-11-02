/* ㈜네오판넬 — 도면 견적(2026-11-02 시안)
   1) 홈 맨 위 컷 넘김 카드(.dq): 손가락 밀기(스크롤 스냅) · 좌우 버튼 · 점 · 5초 자동 넘김(화면에 보일 때만, 손대면 멈춤)
   2) 도면 견적 요청란(#rq-form): 필수 칸 검사 · 파일 여러 개(1개 30MB 이하) · 보내기
      ⚠ 보내는 곳은 REQUEST_ENDPOINT 한 줄만 바꾸면 된다. 비어 있으면 서버로 아무것도 보내지 않고 콘솔에만 찍는다(시안). */

/* ── 보내는 곳(서버 주소) — 카카오톡 알림 서버가 준비되면 여기 한 줄만 바꾼다 ──
   서버는 multipart/form-data 로 받는다: name, phone, sido, sigun, use, use_etc, memo, agree, files[](여러 개), page, sent_at
   성공하면 HTTP 2xx 를 돌려주면 된다(본문은 보지 않는다). */
var REQUEST_ENDPOINT = '';

(function () {
  var root = document.querySelector('.dq'); if (!root) return;
  var track = root.querySelector('.dq-track'), slides = root.querySelectorAll('.dq-slide');
  var dotsBox = root.querySelector('.dq-dots'), playBtn = root.querySelector('.dq-play');
  var n = slides.length, cur = 0, visible = false, timer = null, DELAY = 5000;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var playing = !reduce;
  var dots = [];
  for (var i = 0; i < n; i++) {
    var d = document.createElement('button');
    d.type = 'button'; d.className = 'dq-dot'; d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', (i + 1) + '번째 장 보기');
    (function (k) { d.addEventListener('click', function () { stop(); go(k); }); })(i);
    dotsBox.appendChild(d); dots.push(d);
  }
  /* 장마다 글 길이가 달라 빈 공간이 생기지 않게, 지금 장의 높이에 카드 높이를 맞춘다 */
  function fitH() { var h = slides[cur].offsetHeight; if (h) track.style.height = h + 'px'; }
  function upd() { dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === cur ? 'true' : 'false'); }); root.classList.toggle('dq-at-last', cur === n - 1); fitH(); }
  var target = -1, tgtT = 0;
  function go(i) {
    cur = (i + n) % n; target = cur; clearTimeout(tgtT); tgtT = setTimeout(function () { target = -1; }, 900);
    track.scrollTo({ left: cur * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' }); upd(); arm();
  }
  function setPlay(p) {
    playing = p; playBtn.textContent = p ? '멈춤' : '자동';
    playBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
    playBtn.setAttribute('aria-label', p ? '자동 넘김 멈춤' : '자동 넘김 다시 시작'); arm();
  }
  function stop() { if (playing) setPlay(false); }
  /* 5초 타이머 — 손으로 넘기면 다시 5초부터 */
  function arm() { clearTimeout(timer); if (playing) timer = setTimeout(tick, DELAY); }
  function tick() { if (playing && visible && !document.hidden) go(cur + 1); else arm(); }
  root.querySelector('.dq-prev').addEventListener('click', function () { stop(); go(cur - 1); });
  root.querySelector('.dq-next').addEventListener('click', function () { stop(); go(cur + 1); });
  playBtn.addEventListener('click', function () { setPlay(!playing); if (playing) go(cur + 1); });
  /* 손대면 멈춤: 카드를 누르거나(터치·마우스) 밀면 자동 넘김을 끈다 */
  track.addEventListener('pointerdown', stop, { passive: true });
  track.addEventListener('touchstart', stop, { passive: true });
  track.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) stop(); }, { passive: true });
  root.addEventListener('focusin', function (e) { if (e.target !== playBtn) stop(); });
  track.addEventListener('scroll', function () {
    var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    if (target >= 0) { if (i === target) target = -1; return; }
    if (i !== cur && i >= 0 && i < n) { cur = i; upd(); }
  }, { passive: true });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); stop(); go(cur + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(cur - 1); }
  });
  window.addEventListener('resize', function () { track.style.height = ''; fitH(); track.scrollTo({ left: cur * track.clientWidth, behavior: 'auto' }); });
  [].forEach.call(root.querySelectorAll('img'), function (im) { if (!im.complete) im.addEventListener('load', fitH); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitH);
  try { new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.35 }).observe(track); } catch (e) { visible = true; }
  /* 시험용: ?dq=3 이면 3번째 장부터(스크린샷·확인용) */
  var m = /[?&]dq=(\d+)/.exec(location.search); if (m) { cur = Math.min(n - 1, Math.max(0, +m[1] - 1)); setTimeout(function () { track.scrollTo({ left: cur * track.clientWidth, behavior: 'auto' }); upd(); }, 0); }
  upd(); setPlay(playing);
  window.__dq = { go: go, state: function () { return { cur: cur, playing: playing, visible: visible }; } };
})();

(function () {
  var form = document.getElementById('rq-form'); if (!form) return;
  var MAX = 30 * 1024 * 1024, MAX_N = 10;
  var OK_EXT = ['pdf', 'dwg', 'dxf', 'jpg', 'jpeg', 'png'];
  var input = document.getElementById('rq-files'), list = form.querySelector('.rq-files'), msg = form.querySelector('.rq-filemsg');
  var drop = form.querySelector('.rq-drop'), files = [];
  function ext(n) { var m = /\.([a-z0-9]+)$/i.exec(n || ''); return m ? m[1].toLowerCase() : ''; }
  function size(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(b / 1024)) + 'KB'; }
  function kind(e) { return e === 'pdf' ? 'pdf' : (e === 'dwg' || e === 'dxf') ? 'cad' : 'img'; }
  function render() {
    list.innerHTML = '';
    files.forEach(function (f, i) {
      var e = ext(f.name), li = document.createElement('li');
      li.innerHTML = '<span class="ext ' + kind(e) + '"></span><span class="nm"></span><span class="sz"></span><button type="button" class="rm">빼기</button>';
      li.querySelector('.ext').textContent = e.toUpperCase();
      li.querySelector('.nm').textContent = f.name; li.querySelector('.nm').title = f.name;
      li.querySelector('.sz').textContent = size(f.size);
      li.querySelector('.rm').setAttribute('aria-label', f.name + ' 빼기');
      li.querySelector('.rm').addEventListener('click', function () { files.splice(i, 1); msg.textContent = ''; render(); });
      list.appendChild(li);
    });
    drop.querySelector('b').textContent = files.length ? '파일 더 올리기 (지금 ' + files.length + '개)' : '도면 파일 올리기';
  }
  function add(fl) {
    var bad = [];
    [].slice.call(fl || []).forEach(function (f) {
      var e = ext(f.name);
      if (OK_EXT.indexOf(e) < 0) { bad.push('「' + f.name + '」은(는) 올릴 수 없는 형식입니다 (PDF·DWG·DXF·JPG·PNG만)'); return; }
      if (f.size > MAX) { bad.push('「' + f.name + '」은(는) ' + size(f.size) + '라 30MB를 넘습니다 — 메일로 보내 주세요'); return; }
      if (files.some(function (g) { return g.name === f.name && g.size === f.size; })) return;
      if (files.length >= MAX_N) { bad.push('파일은 한 번에 ' + MAX_N + '개까지 올릴 수 있습니다'); return; }
      files.push(f);
    });
    msg.textContent = bad.join(' / ');
    render();
  }
  input.addEventListener('change', function () { add(input.files); input.value = ''; });
  drop.addEventListener('click', function () { input.click(); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { add(e.dataTransfer && e.dataTransfer.files); });

  /* 연락처: 숫자만 받아 하이픈 자동 */
  var phone = form.elements.phone;
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '').slice(0, 11), v = d;
    if (/^02/.test(d)) v = d.length > 9 ? d.replace(/^(02)(\d{4})(\d{0,4})$/, '$1-$2-$3') : d.replace(/^(02)(\d{0,3})(\d{0,4})$/, '$1-$2-$3');
    else v = d.length > 10 ? d.replace(/^(\d{3})(\d{4})(\d{0,4})$/, '$1-$2-$3') : d.replace(/^(\d{3})(\d{0,3})(\d{0,4})$/, '$1-$2-$3');
    phone.value = v.replace(/-+$/, '');
  });
  /* 용도 「기타」면 적는 칸 */
  var etc = form.querySelector('.rq-etc');
  [].slice.call(form.elements.use).forEach(function (r) { r.addEventListener('change', function () { etc.hidden = form.elements.use.value !== '기타'; if (!etc.hidden) etc.querySelector('input').focus(); }); });

  function mark(field, bad) { field.classList.toggle('rq-bad', !!bad); }
  function check() {
    var first = null;
    var fp = form.querySelector('[data-f="phone"]'), digits = phone.value.replace(/\D/g, '');
    var phoneBad = !/^0\d{8,10}$/.test(digits);
    fp.querySelector('.rq-err').textContent = digits ? '연락처를 끝까지 정확히 적어 주세요 (예: 010-1234-5678)' : '연락처를 적어 주세요 — 견적 연락을 드릴 번호입니다';
    mark(fp, phoneBad); if (phoneBad) first = first || phone;
    var fa = form.querySelector('[data-f="agree"]'), agreeBad = !form.elements.agree.checked;
    mark(fa, agreeBad); if (agreeBad) first = first || form.elements.agree;
    return first;
  }
  phone.addEventListener('blur', function () { if (phone.value) check(); });
  form.elements.agree.addEventListener('change', function () { if (form.elements.agree.checked) mark(form.querySelector('[data-f="agree"]'), false); });

  var sending = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (sending) return;
    var first = check();
    if (first) { first.focus(); var box = first.closest('.rq-f'); if (box && box.scrollIntoView) box.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    if (form.elements.website && form.elements.website.value) return; /* 자동 가입 로봇 거르기(사람 눈엔 안 보이는 칸) */
    var fd = new FormData();
    ['name', 'phone', 'sido', 'sigun', 'use', 'use_etc', 'memo'].forEach(function (k) { var el = form.elements[k]; fd.append(k, el ? (el.value || '').trim() : ''); });
    fd.append('agree', 'yes'); fd.append('page', location.pathname); fd.append('sent_at', new Date().toISOString());
    files.forEach(function (f) { fd.append('files[]', f, f.name); });
    var btn = form.querySelector('.rq-send'), label = btn.textContent;
    sending = true; btn.disabled = true; btn.textContent = '보내는 중입니다…';
    function done() { form.hidden = true; var ok = document.getElementById('rq-done'); ok.hidden = false; ok.focus(); if (ok.scrollIntoView) ok.scrollIntoView({ block: 'start' }); try { if (window.gtag) gtag('event', 'drawing_request_sent', { files: files.length }); } catch (x) {} }
    function fail() { sending = false; btn.disabled = false; btn.textContent = label; alert('보내지 못했습니다. 잠시 뒤 다시 누르시거나, 사무실 041-548-0484 로 전화 주세요.'); }
    if (!REQUEST_ENDPOINT) {
      /* 시안: 서버가 아직 없으므로 보내지 않고 콘솔에만 찍는다 */
      var shown = {}; fd.forEach(function (v, k) { shown[k] = shown[k] || []; shown[k].push(v instanceof File ? v.name + ' (' + size(v.size) + ')' : v); });
      console.log('[도면 견적 요청 — 시안, 서버로 보내지 않음] ' + JSON.stringify(shown));
      setTimeout(done, 600); return;
    }
    fetch(REQUEST_ENDPOINT, { method: 'POST', body: fd }).then(function (r) { if (r.ok) done(); else fail(); }).catch(fail);
  });
})();
