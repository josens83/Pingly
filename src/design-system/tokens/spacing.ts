// Pingly Spacing & Layout System

// 기본 간격 스케일 (4px 기반)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const

// 시맨틱 간격 (용도별)
export const semanticSpacing = {
  // 컴포넌트 내부 패딩
  component: {
    xs: spacing[2],    // 8px - 작은 버튼/뱃지
    sm: spacing[3],    // 12px - 기본 버튼
    md: spacing[4],    // 16px - 카드 패딩
    lg: spacing[6],    // 24px - 큰 카드
    xl: spacing[8],    // 32px - 섹션 내부
  },

  // 요소 간 간격
  gap: {
    xs: spacing[1],    // 4px - 아이콘과 텍스트
    sm: spacing[2],    // 8px - 관련 요소 간
    md: spacing[4],    // 16px - 그룹 간
    lg: spacing[6],    // 24px - 섹션 내 그룹 간
    xl: spacing[8],    // 32px - 큰 그룹 간
  },

  // 섹션 간 간격
  section: {
    sm: spacing[12],   // 48px
    md: spacing[16],   // 64px
    lg: spacing[24],   // 96px
    xl: spacing[32],   // 128px
  },

  // 페이지 여백
  page: {
    x: {
      mobile: spacing[4],   // 16px
      tablet: spacing[6],   // 24px
      desktop: spacing[8],  // 32px
    },
    y: {
      mobile: spacing[6],   // 24px
      tablet: spacing[8],   // 32px
      desktop: spacing[12], // 48px
    },
  },
} as const

// 컨테이너 너비
export const containers = {
  xs: '20rem',      // 320px
  sm: '24rem',      // 384px
  md: '28rem',      // 448px
  lg: '32rem',      // 512px
  xl: '36rem',      // 576px
  '2xl': '42rem',   // 672px
  '3xl': '48rem',   // 768px
  '4xl': '56rem',   // 896px
  '5xl': '64rem',   // 1024px
  '6xl': '72rem',   // 1152px
  '7xl': '80rem',   // 1280px
  full: '100%',
  prose: '65ch',    // 읽기 최적화
} as const

// 브레이크포인트
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Z-인덱스 스케일
export const zIndices = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

// 테두리 반경
export const radii = {
  none: '0',
  sm: '0.25rem',    // 4px
  default: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  full: '9999px',

  // Pingly 시그니처 - 메시지 버블 스타일
  bubble: '1rem 1rem 1rem 0.25rem',
  bubbleReverse: '1rem 1rem 0.25rem 1rem',
} as const

// 그림자
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // 브랜드 컬러 그림자 (호버 등에 사용)
  primarySm: '0 2px 8px -2px rgba(79, 106, 255, 0.3)',
  primary: '0 4px 14px -4px rgba(79, 106, 255, 0.4)',
  primaryLg: '0 8px 24px -6px rgba(79, 106, 255, 0.5)',

  // 성공/에러 상태 그림자
  success: '0 4px 14px -4px rgba(16, 185, 129, 0.4)',
  error: '0 4px 14px -4px rgba(244, 63, 94, 0.4)',

  // 카드 호버 효과
  cardHover: '0 12px 24px -8px rgba(0, 0, 0, 0.15), 0 4px 8px -4px rgba(79, 106, 255, 0.1)',
} as const

// 블러 효과
export const blurs = {
  none: '0',
  sm: '4px',
  default: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
} as const

export type Spacing = keyof typeof spacing
export type Container = keyof typeof containers
export type Breakpoint = keyof typeof breakpoints
export type ZIndex = keyof typeof zIndices
export type Radius = keyof typeof radii
export type Shadow = keyof typeof shadows
