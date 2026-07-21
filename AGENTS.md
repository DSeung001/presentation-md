# presentation-md

Markdown으로 발표/문서를 쓰고, 웹에서 스크롤 또는 슬라이드로 보는 프로젝트다.

## 문서 위치

- 본문: `content/<slug>/index.md`
- 에셋: 같은 폴더에 두고 `./image.webp`로 참조
- URL slug = 폴더 이름

## 에이전트 규칙

`content/**/*.md`를 편집할 때는 Cursor rule **presentation-markdown**을 따른다.

요약:

- 슬라이드 구분: 본문의 `---`
- 상단 제목: `<header>…</header>`
- 코드 크기: `` ```lang {scale=xs|sm|md|lg} ``
- 파일 경로 라벨: `` ```lang {scale=sm, path=api/app/main.py} ``
- CLI: `` ```cli `` / 다이어그램: `` ```mermaid ``

구현 위치:

- fence 파싱·하이라이트: `src/lib/codeHighlight.ts`
- 경로/스케일 CSS: `src/styles/prose.css`
- Markdown 파싱·슬라이드 분할: `src/lib/markdown.ts`

사람용 안내: `README.md`
