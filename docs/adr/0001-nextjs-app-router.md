# ADR 001: Next.js 14 App Router 선택

## 상태
Accepted

## 날짜
2024-12-01

## 맥락
SMS/메신저 마케팅 플랫폼을 위한 풀스택 프레임워크 선택이 필요함.
- 프론트엔드와 백엔드를 통합 관리해야 함
- SEO가 중요한 마케팅 랜딩 페이지 필요
- 실시간 대시보드 구현 필요
- 빠른 개발 속도 우선

## 고려한 옵션들

### 옵션 1: Next.js 14 (App Router)
- 장점: Server Components로 성능 최적화, 최신 React 기능, Vercel 최적화
- 단점: App Router 학습 곡선, 일부 라이브러리 호환성 이슈

### 옵션 2: Next.js 14 (Pages Router)
- 장점: 안정적, 풍부한 예제/문서
- 단점: 레거시 패턴, Server Components 미지원

### 옵션 3: Remix
- 장점: 웹 표준 중심, 중첩 라우팅 우수
- 단점: 상대적으로 작은 생태계, Vercel 최적화 부족

## 결정
**Next.js 14 (App Router)** 선택

이유:
1. Server Components로 초기 로딩 성능 최적화
2. React의 최신 기능 (Suspense, Streaming) 활용 가능
3. Vercel 배포 시 최적의 성능
4. API Routes로 백엔드 로직 통합
5. 강력한 TypeScript 지원

## 결과

### 긍정적
- 프론트엔드/백엔드 코드베이스 통합 관리
- 빌드 시간 최적화
- 자동 코드 스플리팅

### 부정적
- 일부 클라이언트 라이브러리 'use client' 지시어 필요
- 캐싱 동작 이해 필요

### 리스크
- App Router 생태계 성숙도 모니터링 필요
- 복잡한 상태 관리 시 추가 라이브러리 필요 가능
