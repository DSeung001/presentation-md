# presentation-md

Markdown으로 본문을 쓰고, 웹에서 **스크롤 문서** 또는 **슬라이드**로 보는 MVP입니다.

- 사이트: https://dseung001.github.io/presentation-md/

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173/presentation-md/` 로 접속합니다.

## 문서 작성

`content/<slug>/index.md` 형식으로 문서를 추가합니다. 폴더 이름이 문서 URL의 slug가 됩니다.

```text
content/
└── example/
    ├── index.md
    └── diagram.png
```

같은 폴더의 이미지는 Markdown 상대 경로로 참조합니다.

```md
![시스템 구성도](./diagram.png)
```

- `title`: 목록·헤더에 표시
- `date`: 문서 날짜 (예: `2026-07-20`)
- `font`: 한글·영어 공통 글꼴 프리셋 (shorthand)
- `fontKo` / `fontEn`: 한글·영어 글꼴을 각각 지정 (`font`보다 우선)
- 프리셋: `default`, `serif`, `mono`, `display`, `gothic`
- `---`: 슬라이드 모드에서 페이지 구분 (스크롤 모드에서는 구분선)
- 코드 블록 크기: `` ```python {scale=sm} `` (`xs` / `sm` / `md` / `lg`, 또는 `{scale=0.85}` 배율)
- 코드 위 파일 경로: `` ```python {scale=sm, path=api/app/main.py} `` (루트 기준 경로, 작게 표시)

헤더 **글꼴** 메뉴에서 프리셋별 한·영 미리보기를 확인할 수 있습니다.

문서 상단에서 **스크롤** / **슬라이드** 모드를 전환할 수 있습니다. **전체보기**는 버튼 또는 `F` 키로 켜고, `Esc` 또는 `F`로 끕니다.

슬라이드 모드 전체화면에서는 **좌측 35%** 클릭으로 이전, **우측 65%** 클릭으로 다음 슬라이드로 이동합니다. 키보드(`←` `→`, `Space`)도 그대로 사용할 수 있습니다.

**PDF 다운로드** 버튼으로 현재 보기 모드에 맞는 PDF를 저장할 수 있습니다.

- **슬라이드**: 슬라이드당 1페이지 (16:9 가로)
- **스크롤**: 연속 문서 (A4 세로, 여러 페이지로 분할)

## GitHub Pages 배포

`main`에 push하면 Actions가 `dist`를 Pages에 배포합니다.

1. 저장소 **Settings → Pages → Source**를 **GitHub Actions**로 설정
2. 배포 후 URL: https://dseung001.github.io/presentation-md/

로컬 미리보기:

```bash
npm run build
npm run preview
```

`vite.config.ts`의 `base`는 저장소 이름(`/presentation-md/`)과 맞춰 두었습니다.
