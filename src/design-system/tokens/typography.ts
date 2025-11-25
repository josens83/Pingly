// Pingly Typography System
// 전문적이면서도 친근한 타이포그래피

export const fontFamilies = {
  // 메인 산세리프 - 한글과 영문 모두 우수한 가독성
  sans: [
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    'Helvetica Neue',
    'Segoe UI',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    'Malgun Gothic',
    'sans-serif',
  ].join(', '),

  // 모노스페이스 - 숫자, 코드, 데이터 표시
  mono: [
    'GeistMono',
    'JetBrains Mono',
    'SF Mono',
    'Consolas',
    'Liberation Mono',
    'Menlo',
    'monospace',
  ].join(', '),

  // 디스플레이용 (히어로 타이틀 등)
  display: [
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    'sans-serif',
  ].join(', '),
} as const

// 폰트 크기 스케일 (rem 기반)
export const fontSizes = {
  xs: '0.75rem',     // 12px - 캡션, 라벨
  sm: '0.875rem',    // 14px - 보조 텍스트
  base: '1rem',      // 16px - 기본 본문
  lg: '1.125rem',    // 18px - 강조 본문
  xl: '1.25rem',     // 20px - 소제목
  '2xl': '1.5rem',   // 24px - 섹션 제목
  '3xl': '1.875rem', // 30px - 페이지 제목
  '4xl': '2.25rem',  // 36px - 대형 제목
  '5xl': '3rem',     // 48px - 히어로 제목
  '6xl': '3.75rem',  // 60px - 디스플레이
  '7xl': '4.5rem',   // 72px - 대형 디스플레이
} as const

// 폰트 굵기
export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const

// 줄 높이
export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '1.75',
  // 특정 용도
  heading: '1.2',
  body: '1.625',
  caption: '1.5',
} as const

// 자간
export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
  // 특정 용도
  heading: '-0.02em',
  display: '-0.03em',
  caption: '0.02em',
} as const

// 미리 정의된 텍스트 스타일
export const textStyles = {
  // 디스플레이 - 히어로 섹션
  display: {
    fontSize: fontSizes['6xl'],
    fontWeight: fontWeights.extrabold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.display,
    fontFamily: fontFamilies.display,
  },

  // 헤딩 스타일들
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.heading,
    letterSpacing: letterSpacings.heading,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.heading,
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.tight,
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
  },
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
  },
  h6: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
  },

  // 본문 스타일들
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
  },
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.body,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },

  // 캡션/라벨
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.caption,
    letterSpacing: letterSpacings.caption,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  },

  // 특수 용도
  button: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.wide,
  },
  code: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.mono,
  },
  data: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.mono,
    letterSpacing: letterSpacings.tight,
  },
} as const

export type FontFamily = keyof typeof fontFamilies
export type FontSize = keyof typeof fontSizes
export type FontWeight = keyof typeof fontWeights
export type LineHeight = keyof typeof lineHeights
export type LetterSpacing = keyof typeof letterSpacings
export type TextStyle = keyof typeof textStyles
