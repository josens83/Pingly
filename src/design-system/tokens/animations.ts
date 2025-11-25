// Pingly Animation System
// 자연스럽고 의미있는 모션 디자인

// 지속 시간
export const durations = {
  instant: '0ms',
  fastest: '50ms',
  faster: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
  slowest: '500ms',
  // 특수 용도
  pageTransition: '400ms',
  modalOpen: '250ms',
  modalClose: '200ms',
  tooltip: '150ms',
  notification: '300ms',
} as const

// 이징 함수
export const easings = {
  // 기본
  linear: 'linear',

  // 표준 이징
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // 스프링 효과 (바운스)
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  springGentle: 'cubic-bezier(0.25, 1.25, 0.5, 1)',

  // 부드러운 감속
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  smoothOut: 'cubic-bezier(0, 0.55, 0.45, 1)',

  // 강조 효과
  emphasis: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',

  // 입/출 전용
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const

// 미리 정의된 트랜지션
export const transitions = {
  // 기본 트랜지션
  default: `all ${durations.normal} ${easings.easeOut}`,
  fast: `all ${durations.fast} ${easings.easeOut}`,
  slow: `all ${durations.slow} ${easings.easeOut}`,

  // 속성별 트랜지션
  colors: `color ${durations.fast} ${easings.easeOut}, background-color ${durations.fast} ${easings.easeOut}, border-color ${durations.fast} ${easings.easeOut}`,
  opacity: `opacity ${durations.normal} ${easings.easeOut}`,
  transform: `transform ${durations.normal} ${easings.smooth}`,
  shadow: `box-shadow ${durations.normal} ${easings.easeOut}`,

  // 컴포넌트 전용
  button: `all ${durations.fast} ${easings.easeOut}, transform ${durations.fast} ${easings.spring}`,
  card: `all ${durations.normal} ${easings.smooth}, transform ${durations.slow} ${easings.smooth}`,
  modal: `all ${durations.slow} ${easings.smooth}`,
  dropdown: `all ${durations.fast} ${easings.easeOut}, opacity ${durations.fast} ${easings.easeOut}`,
} as const

// Framer Motion용 애니메이션 variants
export const motionVariants = {
  // 페이드 인/아웃
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // 아래에서 위로 페이드
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },

  // 위에서 아래로 페이드
  fadeDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },

  // 왼쪽에서 오른쪽으로 (메시지 보내기 모션)
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  // 오른쪽에서 왼쪽으로
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  // 스케일 인
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  // 스프링 스케일 (버튼 클릭 등)
  springScale: {
    initial: { scale: 1 },
    animate: { scale: 1 },
    tap: { scale: 0.97 },
    hover: { scale: 1.02 },
  },

  // 모달
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
    },
  },

  // 오버레이
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },

  // 드롭다운
  dropdown: {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.15, ease: [0, 0, 0.2, 1] }
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.98,
      transition: { duration: 0.1 }
    },
  },

  // 토스트 알림
  toast: {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.9,
      transition: { duration: 0.2 }
    },
  },

  // 리스트 아이템 (stagger용)
  listItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },

  // 카드 호버
  cardHover: {
    initial: { y: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    hover: {
      y: -4,
      boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    },
  },

  // 성공 체크마크 그리기
  checkmark: {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
  },

  // 펄스 (알림 등)
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    },
  },

  // 메시지 타이핑 인디케이터
  typingDot: {
    animate: {
      y: [0, -8, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
    },
  },
} as const

// Stagger 컨테이너 (자식 요소 순차 애니메이션)
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
} as const

// CSS 키프레임 애니메이션 (Tailwind 확장용)
export const keyframes = {
  // 스피너
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },

  // 펄스
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },

  // 바운스
  bounce: {
    '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
    '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
  },

  // 쉬머 (스켈레톤 로딩)
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },

  // 슬라이드 업
  slideUp: {
    from: { transform: 'translateY(100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },

  // 슬라이드 다운
  slideDown: {
    from: { transform: 'translateY(-100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },

  // 페이드 인
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },

  // 스케일 인
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },

  // 흔들기 (에러 등)
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-4px)' },
    '75%': { transform: 'translateX(4px)' },
  },

  // 알림 벨 흔들기
  ring: {
    '0%, 100%': { transform: 'rotate(0deg)' },
    '25%': { transform: 'rotate(10deg)' },
    '50%': { transform: 'rotate(-10deg)' },
    '75%': { transform: 'rotate(5deg)' },
  },
} as const

export type Duration = keyof typeof durations
export type Easing = keyof typeof easings
export type Transition = keyof typeof transitions
export type MotionVariant = keyof typeof motionVariants
