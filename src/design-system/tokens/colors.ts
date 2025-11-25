// Pingly Color System
// 브랜드 아이덴티티를 반영한 커스텀 컬러 팔레트

export const colors = {
  // Primary - "Pingly Blue" 시그니처 컬러
  // 신뢰감과 전문성을 전달하면서도 따뜻함을 유지
  pingly: {
    50: '#EEF4FF',
    100: '#D9E5FF',
    200: '#B3CCFF',
    300: '#809FFF',
    400: '#6680FF',
    500: '#4F6AFF', // Main brand color
    600: '#3D4EDB',
    700: '#2E3AB7',
    800: '#1F2993',
    900: '#1A1F4D',
    950: '#0D0F26',
  },

  // Secondary - "Connection Violet" 연결과 창의성
  violet: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Main secondary
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Accent - "Success Mint" 전송 성공, 긍정적 피드백
  mint: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399', // Main accent
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Warning - "Alert Amber"
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error - "Alert Rose"
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // Warm Neutral - 차가운 회색 대신 따뜻한 뉴트럴
  warm: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0C0A09',
  },

  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const

// 그라데이션 정의
export const gradients = {
  // 히어로 섹션용 시그니처 그라데이션
  hero: 'linear-gradient(135deg, #4F6AFF 0%, #8B5CF6 50%, #EC4899 100%)',
  heroSubtle: 'linear-gradient(135deg, rgba(79,106,255,0.1) 0%, rgba(139,92,246,0.1) 100%)',

  // 카드 배경
  cardHover: 'linear-gradient(180deg, rgba(79,106,255,0.05) 0%, transparent 100%)',
  cardHighlight: 'linear-gradient(135deg, rgba(79,106,255,0.1) 0%, rgba(139,92,246,0.05) 100%)',

  // 버튼
  primaryButton: 'linear-gradient(135deg, #4F6AFF 0%, #6680FF 100%)',
  primaryButtonHover: 'linear-gradient(135deg, #3D4EDB 0%, #4F6AFF 100%)',

  // 성공/에러 상태
  success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  error: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)',

  // 배경 장식
  meshGradient: `
    radial-gradient(at 40% 20%, rgba(79,106,255,0.15) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(139,92,246,0.1) 0px, transparent 50%),
    radial-gradient(at 0% 50%, rgba(236,72,153,0.1) 0px, transparent 50%)
  `,

  // 다크모드용
  darkHero: 'linear-gradient(135deg, #1A1F4D 0%, #2E3AB7 50%, #5B21B6 100%)',
  darkCard: 'linear-gradient(180deg, rgba(79,106,255,0.1) 0%, rgba(0,0,0,0) 100%)',
} as const

// 시맨틱 컬러 (용도별)
export const semanticColors = {
  // 배경
  background: {
    primary: colors.white,
    secondary: colors.warm[50],
    tertiary: colors.warm[100],
    inverse: colors.warm[900],
    brand: colors.pingly[50],
  },

  // 표면 (카드, 모달 등)
  surface: {
    primary: colors.white,
    secondary: colors.warm[50],
    elevated: colors.white,
    overlay: 'rgba(0,0,0,0.5)',
  },

  // 텍스트
  text: {
    primary: colors.warm[900],
    secondary: colors.warm[600],
    tertiary: colors.warm[500],
    inverse: colors.white,
    brand: colors.pingly[600],
    link: colors.pingly[500],
    linkHover: colors.pingly[700],
  },

  // 보더
  border: {
    primary: colors.warm[200],
    secondary: colors.warm[100],
    focus: colors.pingly[500],
    error: colors.rose[500],
  },

  // 상태
  status: {
    success: colors.mint[500],
    successBg: colors.mint[50],
    warning: colors.amber[500],
    warningBg: colors.amber[50],
    error: colors.rose[500],
    errorBg: colors.rose[50],
    info: colors.pingly[500],
    infoBg: colors.pingly[50],
  },

  // 인터랙션
  interactive: {
    primary: colors.pingly[500],
    primaryHover: colors.pingly[600],
    primaryActive: colors.pingly[700],
    secondary: colors.warm[100],
    secondaryHover: colors.warm[200],
  },
} as const

// 다크모드 시맨틱 컬러
export const darkSemanticColors = {
  background: {
    primary: colors.warm[950],
    secondary: colors.warm[900],
    tertiary: colors.warm[800],
    inverse: colors.white,
    brand: colors.pingly[950],
  },

  surface: {
    primary: colors.warm[900],
    secondary: colors.warm[800],
    elevated: colors.warm[800],
    overlay: 'rgba(0,0,0,0.7)',
  },

  text: {
    primary: colors.warm[50],
    secondary: colors.warm[400],
    tertiary: colors.warm[500],
    inverse: colors.warm[900],
    brand: colors.pingly[400],
    link: colors.pingly[400],
    linkHover: colors.pingly[300],
  },

  border: {
    primary: colors.warm[700],
    secondary: colors.warm[800],
    focus: colors.pingly[400],
    error: colors.rose[400],
  },

  status: {
    success: colors.mint[400],
    successBg: 'rgba(16, 185, 129, 0.1)',
    warning: colors.amber[400],
    warningBg: 'rgba(245, 158, 11, 0.1)',
    error: colors.rose[400],
    errorBg: 'rgba(244, 63, 94, 0.1)',
    info: colors.pingly[400],
    infoBg: 'rgba(79, 106, 255, 0.1)',
  },

  interactive: {
    primary: colors.pingly[500],
    primaryHover: colors.pingly[400],
    primaryActive: colors.pingly[300],
    secondary: colors.warm[800],
    secondaryHover: colors.warm[700],
  },
} as const

export type ColorToken = typeof colors
export type GradientToken = typeof gradients
export type SemanticColorToken = typeof semanticColors
