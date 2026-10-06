// 홈 화면 추가(설치) 조건을 맞추기 위한 최소 서비스워커 — 아무것도 저장(캐시)하지 않고 그대로 통과시킨다.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () { /* 그대로 네트워크로 — 캐시 없음 */ });
