/* 책반디 서비스 워커
   - 앱 껍데기는 설치할 때 미리 저장해 두고
   - 글꼴은 한 번 받아온 뒤부터 저장본을 쓴다
   앱을 고친 뒤에는 아래 VERSION 숫자를 올리고,
   app.vN.js 파일 이름의 숫자도 함께 올려주세요. */

const VERSION = "v3";
const SHELL_CACHE = "chaekbandi-shell-" + VERSION;
const FONT_CACHE = "chaekbandi-font-" + VERSION;

const SHELL_FILES = [
  "./",
  "./index.html",
  "./app.v3.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

/* 설치 : 앱 껍데기를 통째로 저장 */
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

/* 활성화 : 예전 버전 저장본을 지운다 */
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      const old = [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key !== SHELL_CACHE && key !== FONT_CACHE) {
          old.push(caches.delete(key));
        }
      }
      return Promise.all(old);
    })
  );
  self.clients.claim();
});

/* 요청 가로채기 */
self.addEventListener("fetch", function (event) {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isFont =
    url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

  /* 1) 글꼴 : 저장본을 먼저 주고, 뒤에서 조용히 새로 받아둔다 */
  if (isFont) {
    event.respondWith(
      caches.open(FONT_CACHE).then(function (cache) {
        return cache.match(request).then(function (cached) {
          const network = fetch(request)
            .then(function (response) {
              if (response && (response.ok || response.type === "opaque")) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(function () {
              return cached;
            });
          return cached || network;
        });
      })
    );
    return;
  }

  /* 다른 사이트 요청은 건드리지 않는다 */
  if (url.origin !== self.location.origin) return;

  /* 2) 페이지 이동 : 새 걸 먼저 받아보고, 안 되면 저장된 index.html */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then(function (cache) {
            cache.put("./index.html", copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match("./index.html", { ignoreSearch: true });
        })
    );
    return;
  }

  /* 3) 나머지 파일 : 저장본 먼저, 없으면 받아서 저장 */
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      });
    })
  );
});
