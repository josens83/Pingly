/**
 * PWA Manifest Configuration
 *
 * Web App Manifest generator for Pingly
 */

export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface ManifestShortcut {
  name: string;
  short_name?: string;
  description?: string;
  url: string;
  icons?: ManifestIcon[];
}

export interface ManifestScreenshot {
  src: string;
  sizes: string;
  type: string;
  platform?: 'wide' | 'narrow';
  label?: string;
}

export interface WebAppManifest {
  name: string;
  short_name: string;
  description?: string;
  start_url: string;
  scope?: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  display_override?: ('fullscreen' | 'standalone' | 'minimal-ui' | 'browser' | 'window-controls-overlay')[];
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';
  theme_color?: string;
  background_color?: string;
  icons: ManifestIcon[];
  shortcuts?: ManifestShortcut[];
  screenshots?: ManifestScreenshot[];
  categories?: string[];
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  prefer_related_applications?: boolean;
  related_applications?: {
    platform: string;
    url: string;
    id?: string;
  }[];
  scope_extensions?: {
    origin: string;
  }[];
  handle_links?: 'auto' | 'preferred' | 'not-preferred';
  launch_handler?: {
    client_mode: 'auto' | 'navigate-new' | 'navigate-existing' | 'focus-existing';
  };
  share_target?: {
    action: string;
    method?: 'GET' | 'POST';
    enctype?: string;
    params: {
      title?: string;
      text?: string;
      url?: string;
      files?: {
        name: string;
        accept: string[];
      }[];
    };
  };
  file_handlers?: {
    action: string;
    accept: Record<string, string[]>;
    icons?: ManifestIcon[];
    launch_type?: 'single-client' | 'multiple-clients';
  }[];
  protocol_handlers?: {
    protocol: string;
    url: string;
  }[];
  edge_side_panel?: {
    preferred_width?: number;
  };
}

/**
 * Generate Pingly PWA manifest
 */
export function generateManifest(options?: Partial<WebAppManifest>): WebAppManifest {
  const defaultManifest: WebAppManifest = {
    name: 'Pingly - 스마트 메시지 마케팅',
    short_name: 'Pingly',
    description: 'SMS 및 메신저 마케팅을 위한 스마트 플랫폼',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    orientation: 'any',
    theme_color: '#6366F1',
    background_color: '#FFFFFF',
    lang: 'ko',
    dir: 'ltr',
    categories: ['business', 'productivity', 'marketing'],
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    shortcuts: [
      {
        name: '새 메시지 작성',
        short_name: '새 메시지',
        description: '새로운 메시지를 작성합니다',
        url: '/messages/new',
        icons: [
          {
            src: '/icons/shortcut-message.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: '캠페인 관리',
        short_name: '캠페인',
        description: '마케팅 캠페인을 관리합니다',
        url: '/campaigns',
        icons: [
          {
            src: '/icons/shortcut-campaign.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: '연락처',
        short_name: '연락처',
        description: '연락처 목록을 확인합니다',
        url: '/contacts',
        icons: [
          {
            src: '/icons/shortcut-contacts.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: '분석 대시보드',
        short_name: '분석',
        description: '마케팅 성과를 분석합니다',
        url: '/analytics',
        icons: [
          {
            src: '/icons/shortcut-analytics.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      }
    ],
    screenshots: [
      {
        src: '/screenshots/dashboard-wide.png',
        sizes: '1920x1080',
        type: 'image/png',
        platform: 'wide',
        label: '대시보드 화면'
      },
      {
        src: '/screenshots/messages-wide.png',
        sizes: '1920x1080',
        type: 'image/png',
        platform: 'wide',
        label: '메시지 관리 화면'
      },
      {
        src: '/screenshots/dashboard-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        platform: 'narrow',
        label: '모바일 대시보드'
      },
      {
        src: '/screenshots/messages-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        platform: 'narrow',
        label: '모바일 메시지 화면'
      }
    ],
    share_target: {
      action: '/share',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url'
      }
    },
    file_handlers: [
      {
        action: '/import',
        accept: {
          'text/csv': ['.csv'],
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'application/vnd.ms-excel': ['.xls']
        }
      }
    ],
    protocol_handlers: [
      {
        protocol: 'web+pingly',
        url: '/handle?url=%s'
      }
    ],
    launch_handler: {
      client_mode: 'focus-existing'
    },
    handle_links: 'preferred'
  };

  return {
    ...defaultManifest,
    ...options,
    icons: options?.icons || defaultManifest.icons,
    shortcuts: options?.shortcuts || defaultManifest.shortcuts,
    screenshots: options?.screenshots || defaultManifest.screenshots
  };
}

/**
 * Generate manifest JSON string
 */
export function generateManifestJSON(options?: Partial<WebAppManifest>): string {
  return JSON.stringify(generateManifest(options), null, 2);
}

/**
 * Default manifest for Pingly
 */
export const defaultManifest = generateManifest();
