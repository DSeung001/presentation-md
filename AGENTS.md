# presentation-md

Markdown으로 발표/문서를 쓰고, 웹에서 **스크롤** 또는 **슬라이드**로 보는 MVP다.
Git으로 버전 관리하고, GitHub Pages에 배포한다.

- 사이트: https://dseung001.github.io/presentation-md/
- 사람용 안내: `README.md`

## content/ — 문서 위치

새 발표는 여기만 추가하면 된다.

```text
content/<slug>/
├── index.md      ← 본문 (필수)
└── image.webp    ← 이미지·에셋 (선택)
```

- 폴더 이름 = URL slug → `/p/<slug>`
- 이미지는 같은 폴더에 두고 `./image.webp`로 참조

## content/ — 작성법

`content/**/*.md` 편집 시 Cursor rule **presentation-markdown**을 따른다.

### Frontmatter

```yaml
---
title: 문서 제목
date: 2026-09-14
fontKo: default
fontEn: default
---
```

- `font` 또는 `fontKo` / `fontEn`: `default` | `serif` | `mono` | `display` | `gothic`

### 본문

- 슬라이드 구분: 본문 단독 줄 `---` (스크롤 모드에서는 구분선)
- 상단 제목: `<header>제목</header>`
- 레이아웃 클래스 (`<div class="…">`로 감싼다)
  - `img-grid` — 이미지 2열
  - `split-row` — 이미지 + 리스트 좌우
  - `stack-below` — 텍스트 위, 가로로 긴 이미지 아래(남은 높이만)
- `img-slot` — 상대 경로 이미지가 없을 때 엔진이 넣는 자리표시 (작성자가 직접 쓰지 않음)
- 코드: `` ```python {scale=sm, path=api/app/main.py, lines=8} ``
  - `scale`: `xs` | `sm` | `md` | `lg` (줄수 상한 xs≤18, sm≤14, md≤12, lg≤9)
  - 상한 초과 시 `(1/N)` 슬라이드로 분할
- CLI: `` ```cli `` · 다이어그램: `` ```mermaid ``

### 최소 예시

```md
---
title: 예시 발표
date: 2026-09-14
---

# 예시 발표

한 줄 소개

---

<header>첫 슬라이드</header>

- 요점 하나
- 요점 둘

![다이어그램](./diagram.webp)
```

## 실행

```bash
npm install
npm run dev
```

→ `http://localhost:5173/presentation-md/`

## 구현 위치 (코드 수정 시)

- Markdown 파싱·슬라이드 분할: `src/lib/markdown.ts`
- fence 파싱·하이라이트: `src/lib/codeHighlight.ts`
- 경로/스케일 CSS: `src/styles/prose.css`
