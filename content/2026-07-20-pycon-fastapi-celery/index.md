---
title: PyCon 2026 FastAPI + Celery 영상 인코딩
date: 2026-07-20
fontKo: gothic
fontEn: gothic
---

# FastAPI + Celery 영상 인코딩

PyCon 2026 핸즈온 튜토리얼

---

<header>프로젝트 목표</header>

- `FastAPI`와 `Celery`를 이용한 비동기 작업해보기
- 동영상 인코딩 작업에 대한 이해 
- 스트리밍 서비스 배포에 대한 흐름

---

<header>동영상 인코딩이란</header>

### HLS
동영상 로드를 빠르게 하기 위해 파일을 일정 크기로 나눠서 재생하는 HTTP 스트리밍 방식으로 <br/>
클라이언트는 HTTP로 서버로부터 세그먼트를 받아 이를 재생해서 빠른 재생이 가능

### 비동기 작업
오래 걸리는 작업을 사용자가 그대로 기다리지 않고 데이터만 추가한 뒤 <br/>
실제 작업은 서버에서 백그라운드로 처리하는 방식

---


<header>HLS</header>

![HLS](./hls.webp)

---

<header>비동기 작업</header>

![Async](./async.webp)

---

<header>구성할 시스템</header>

업로드는 API가 받고, 인코딩은 Celery worker가 Redis 큐를 통해 백그라운드에서 처리

```mermaid
flowchart LR
    Browser["Browser / UI"]
    FastAPI["FastAPI api"]
    Redis["Redis broker"]
    Celery["Celery worker"]
    FFmpeg["FFmpeg HLS"]
    Data["data volume"]

    Browser -->|"1. 영상 업로드"| FastAPI
    Browser -->|"2. 작업 상태 조회 polling"| FastAPI
    Browser -->|"3. HLS 재생 요청"| FastAPI
    FastAPI -->|"enqueue task"| Redis
    Redis -->|"consume"| Celery
    Celery --> FFmpeg
    FastAPI --> Data
    Celery --> Data
    FastAPI -->|"HLS manifest / segments"| Browser
```

- FastAPI: 업로드 수신, 작업 enqueue, 상태 API 제공, 정적 페이지와 HLS 서빙
- Redis: Celery broker(작업 큐)와 result backend(작업 상태)
- Celery worker: Redis에서 작업을 consume하고 FFmpeg로 인코딩 실행
- FFmpeg: 원본 영상을 HLS manifest와 segment로 변환
- data volume: 업로드 원본과 인코딩 결과를 API와 worker가 공유

---

<header>실습</header>

### 체크포인트

기본 세팅에서 API를 먼저 만들고, Celery 세팅으로 인코딩 결과물까지 이어갑니다.

1. 기본 세팅
   - `checkpoint/01-fastapi-upload`: FastAPI로 영상 업로드와 저장

2. Celery 세팅 (결과물까지)
   - `checkpoint/02-celery-redis`: Redis + Celery로 작업 enqueue와 상태 조회
   - `checkpoint/03-ffmpeg-hls`: worker에서 FFmpeg로 HLS 결과 생성
   - `checkpoint/04-hls-player`: polling과 재생으로 최종 결과 확인

---

<header>사이드 프로젝트 경험담</header>

---

<header>Q&A</header>
