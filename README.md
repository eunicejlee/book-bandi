# 책반디 (PWA)

종이책에 카메라를 비추고 궁금한 단어를 누르면 바로 이해되는 AI 독서 친구.
GitHub Pages에 그대로 올리면 되는 정적 파일 묶음입니다.

## 파일

| 파일 | 하는 일 |
| --- | --- |
| `index.html` | 앱 진입 화면 + 서비스 워커 등록 |
| `app.v3.js` | React 앱 본체 (번들 완료, 빌드 불필요) |
| `manifest.json` | 앱 이름·아이콘·시작 주소·바로가기 |
| `sw.js` | 오프라인 저장 담당 (서비스 워커) |
| `icons/` | 홈 화면 아이콘 (192 / 512 / maskable / iOS) |
| `.nojekyll` | GitHub Pages가 파일을 건드리지 않게 함 |

## 올리는 방법

```bash
# 1. 새 저장소를 만들고 이 폴더의 내용을 통째로 넣는다
git init
git add .
git commit -m "책반디 PWA"
git branch -M main
git remote add origin https://github.com/ohmycoding1/chaekbandi.git
git push -u origin main
```

그다음 GitHub 저장소에서
**Settings → Pages → Source: Deploy from a branch → main / (root)** 로 지정하고 저장.

1~2분 뒤 `https://ohmycoding1.github.io/chaekbandi/` 로 열립니다.

> 모든 경로를 `./` 상대 경로로 썼기 때문에 하위 경로(`/chaekbandi/`)에서도 그대로 동작합니다.

## 홈 화면에 추가

- **안드로이드(크롬)** : 주소 열기 → 우측 위 ⋮ → `앱 설치` 또는 `홈 화면에 추가`
- **아이폰(사파리)** : 주소 열기 → 공유 버튼 → `홈 화면에 추가`
  (아이폰은 반드시 사파리로 열어야 합니다)

추가하면 주소창 없이 전체 화면으로 뜨고, 아이콘·이름·시작 화면이 일반 앱처럼 보입니다.
안드로이드에서는 아이콘을 길게 누르면 **책 비추기** 바로가기가 나옵니다.

## 앱을 고친 뒤에 (중요)

서비스 워커가 예전 파일을 들고 있어서 화면이 안 바뀔 수 있습니다.
고친 뒤에는 **세 군데의 숫자를 같이** 올려주세요.

1. 번들 파일 이름 : `app.v3.js` → `app.v4.js`
2. `index.html` 안의 `<script src="./app.v3.js" defer>` → `app.v4.js`
3. `sw.js` 맨 위의 `const VERSION = "v3"` → `"v4"` 와 목록의 `"./app.v3.js"` → `"./app.v4.js"`

파일 이름 자체가 바뀌면 브라우저·서비스 워커·GitHub CDN 어느 쪽도
예전 파일을 내줄 수 없습니다. 접속하면 자동으로 새 화면을 받아갑니다.

## 안 바뀔 때 확인 순서

1. 설정 화면 맨 아래 버전이 `책반디 v1.2` 인지 본다 (아니면 예전 파일)
2. 시크릿 창으로 열어본다 → 여기서 새 화면이면 캐시 문제가 맞다
3. 폰: 설정 → 앱 → 브라우저 → 저장 공간 → 캐시 삭제
   PC 크롬: F12 → Application → Service Workers → Unregister → 새로고침
4. GitHub Pages는 올린 뒤 반영까지 1~2분 걸린다

## 참고

- 발견한 단어·설명 난이도·글씨 크기는 기기에 저장됩니다(localStorage).
  설정 화면의 `초기화` 로 비울 수 있어요.
- 카메라·OCR·AI 설명·AI 그림은 모두 시뮬레이션입니다. 외부 통신은 글꼴 외에 없습니다.
