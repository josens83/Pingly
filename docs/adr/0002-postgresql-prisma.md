# ADR 002: PostgreSQL + Prisma ORM 선택

## 상태
Accepted

## 날짜
2024-12-01

## 맥락
마케팅 플랫폼의 데이터베이스 및 ORM 선택이 필요함.
- 사용자, 연락처, 캠페인, 메시지 이력 저장
- 복잡한 관계형 쿼리 필요 (캠페인-연락처-메시지)
- JSON 데이터 저장 필요 (메시지 템플릿, 설정)
- 타입 안전성 중요

## 고려한 옵션들

### 옵션 1: PostgreSQL + Prisma
- 장점: 타입 안전한 쿼리, 자동 마이그레이션, JSONB 지원, 풍부한 생태계
- 단점: Prisma Client 생성 필요, 복잡한 쿼리 시 raw SQL 필요

### 옵션 2: PostgreSQL + Drizzle
- 장점: SQL에 가까운 문법, 가벼움, 빠른 빌드
- 단점: 상대적으로 작은 커뮤니티, 문서 부족

### 옵션 3: MongoDB + Mongoose
- 장점: 스키마 유연성, JSON 네이티브
- 단점: 관계형 쿼리 복잡, 트랜잭션 제한

## 결정
**PostgreSQL + Prisma** 선택

이유:
1. Prisma Client로 완벽한 TypeScript 타입 안전성
2. 자동 마이그레이션으로 스키마 버전 관리
3. JSONB로 관계형 + JSON 데이터 동시 처리
4. Supabase/Neon 등 무료 호스팅 옵션 풍부
5. Next.js + Vercel과의 통합 우수

## 결과

### 긍정적
- 컴파일 타임 쿼리 오류 검출
- Prisma Studio로 데이터 시각화
- 선언적 스키마 관리

### 부정적
- prisma generate 빌드 단계 필요
- 복잡한 집계 쿼리 시 raw SQL 필요

### 리스크
- 대량 데이터 처리 시 성능 모니터링 필요
- Connection Pooling 설정 필수 (Serverless 환경)
