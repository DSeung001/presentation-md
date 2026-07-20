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

`content/`에 `.md` 파일을 추가합니다.

- YAML frontmatter의 `title`: 목록·헤더에 표시
- `---`: 슬라이드 모드에서 페이지 구분 (스크롤 모드에서는 구분선)

문서 상단에서 **스크롤** / **슬라이드** 모드를 전환할 수 있습니다. 슬라이드 모드에서는 ← → / Space 또는 하단 버튼으로 넘깁니다.

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
