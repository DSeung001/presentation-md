# presentation-md

Markdown으로 본문을 쓰고, 웹에서 **스크롤 문서** 또는 **슬라이드**로 보는 MVP입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 안내된 주소(보통 `http://localhost:5173/presentation-md/`)로 접속합니다.

## 문서 작성

`content/`에 `.md` 파일을 추가합니다.

```markdown
---
title: 문서 제목
---

# 첫 슬라이드

내용...

---

## 두 번째 슬라이드

- 항목
```

- `title`: 목록·헤더에 표시
- `---`: 슬라이드 모드에서 페이지 구분 (스크롤 모드에서는 구분선)

## 보기 모드

문서 상단에서 **스크롤** / **슬라이드**를 전환합니다.

- 스크롤: 일반 문서처럼 세로로 읽기
- 슬라이드: ← → / Space, 하단 이전·다음으로 넘기기  
  URL 예: `/presentation-md/p/welcome?view=slides`

## GitHub Pages 배포

`main`에 push하면 Actions가 `dist`를 Pages에 배포합니다.

1. 저장소 **Settings → Pages → Source**를 **GitHub Actions**로 설정
2. 배포 후 URL: `https://<user>.github.io/presentation-md/`

로컬 미리보기:

```bash
npm run build
npm run preview
```

`vite.config.ts`의 `base`는 저장소 이름(`/presentation-md/`)과 맞춰 두었습니다. 저장소 이름을 바꾸면 `base`도 함께 수정하세요.
