---
title: PyCon 2026 FastAPI + Celery 영상 인코딩
date: 2026-07-20
fontKo: gothic
fontEn: serif
---

# FastAPI + Celery 영상 인코딩

PyCon 2026 핸즈온 튜토리얼

---

## 한 문장 요약

FastAPI 요청 안에서 오래 걸리는 영상 인코딩을 실행하지 않고, Redis와 Celery로 백그라운드 worker에 분리합니다.

---

## 왜 분리하는가?

- 클라이언트·프록시 타임아웃
- API worker 장시간 점유
- 사용자 응답 지연
- 실패·재시도 처리 복잡

---

## 구성 요소

- **FastAPI** — 업로드, 작업 생성, 상태 API
- **Redis** — Celery broker·result backend
- **Celery** — 비동기 작업 실행
- **FFmpeg** — HLS 변환
- **Docker Compose** — 환경 통일

---

## 시스템 흐름

1. `POST /api/videos` → 업로드 저장, 작업 enqueue
2. API는 `202 Accepted` + `job_id` 즉시 반환
3. Celery worker가 FFmpeg 실행
4. `GET /api/jobs/{job_id}`로 상태 polling
5. 완료 후 HLS 재생·원본과 비교

---

## 체크포인트

1. `01-fastapi-upload` — 업로드 저장
2. `02-celery-redis` — Redis·Celery·비동기 상태
3. `03-ffmpeg-hls` — worker FFmpeg·실패 처리
4. `04-hls-player` — polling·hls.js·비교 UI

---

## 실행

```bash
python scripts/dev.py docker
```

브라우저: http://localhost:8000

---

## 끝

질문 있으신가요?
