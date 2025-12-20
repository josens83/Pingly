'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react'
import { ToastProvider, TooltipProvider } from '@/components/primitives'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

// Enterprise modules
import { analytics } from '@/lib/analytics'
import { featureFlags, type UserContext } from '@/lib/experimentation'
import { i18n } from '@/lib/i18n'
import { pwa } from '@/lib/pwa'
import { offlineStorage, syncManager, defaultStorageConfig } from '@/lib/offline'
import { initWebVitals } from '@/lib/performance/WebVitals'
import { wsClient, type ConnectionState } from '@/lib/realtime/WebSocketClient'
import { generateCSSVariables, defaultTheme } from '@/lib/design-system'

// App Context for global state
interface AppContextValue {
  isOnline: boolean;
  isOfflineReady: boolean;
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  wsState: ConnectionState;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
}

const AppContext = createContext<AppContextValue>({
  isOnline: true,
  isOfflineReady: false,
  locale: 'ko-KR',
  setLocale: async () => {},
  wsState: 'disconnected',
  connectWebSocket: async () => {},
  disconnectWebSocket: () => {},
});

export const useApp = () => useContext(AppContext);

// Enterprise initialization hook
function useEnterpriseInit() {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [locale, setLocaleState] = useState('ko-KR');
  const [wsState, setWsState] = useState<ConnectionState>('disconnected');

  // WebSocket methods
  const connectWebSocket = useCallback(async () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ||
      (typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws`
        : '');

    if (wsUrl) {
      try {
        await wsClient.connect(wsUrl);
        analytics.track('$websocket_connected');
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    wsClient.disconnect();
  }, []);

  useEffect(() => {
    // Initialize Design System CSS Variables
    if (typeof document !== 'undefined') {
      const styleId = 'pingly-design-tokens';
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }

      styleEl.textContent = generateCSSVariables(defaultTheme);
    }

    // Initialize Analytics
    analytics.initialize({
      apiEndpoint: '/api/analytics',
      debug: process.env.NODE_ENV === 'development',
      flushInterval: 10000,
    });

    // Track initial page view
    analytics.page();

    // Initialize Web Vitals
    initWebVitals();

    // Initialize i18n
    i18n.initialize({
      defaultLocale: 'ko-KR',
      supportedLocales: ['ko-KR', 'en-US', 'ja-JP', 'zh-CN'],
      fallbackLocale: 'en-US',
      loadPath: '/locales/{{locale}}/{{namespace}}.json',
    }).then(() => {
      setLocaleState(i18n.getLocale());
    });

    // Initialize PWA
    pwa.initialize({
      onInstallPrompt: () => {
        analytics.track('$pwa_install_prompt');
      },
      onInstalled: () => {
        analytics.track('$pwa_installed');
      },
      onUpdateAvailable: () => {
        console.log('New version available!');
      },
      onOnline: () => setIsOnline(true),
      onOffline: () => setIsOnline(false),
    });

    // Initialize Offline Storage
    offlineStorage.initialize(defaultStorageConfig).then(() => {
      setIsOfflineReady(true);

      // Configure sync manager
      syncManager.configure({
        autoSync: true,
        syncInterval: 30000,
        conflictStrategy: 'client_wins',
      });
    });

    // Setup WebSocket state listener
    const unsubscribeWsState = wsClient.onEvent('stateChange', (event: unknown) => {
      const stateEvent = event as { to: ConnectionState };
      setWsState(stateEvent.to);
    });

    // Initialize Feature Flags
    featureFlags.initialize([
      {
        id: 'new_dashboard',
        name: '새 대시보드',
        description: '개선된 대시보드 UI',
        enabled: true,
        rolloutPercentage: 100,
        targetingRules: [],
        variants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: 'system',
        tags: ['ui'],
      },
      {
        id: 'ai_message_suggestions',
        name: 'AI 메시지 추천',
        description: 'AI 기반 메시지 템플릿 추천',
        enabled: true,
        rolloutPercentage: 50,
        targetingRules: [],
        variants: [
          { id: 'control', name: '기본', weight: 50 },
          { id: 'treatment', name: 'AI 추천', weight: 50 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: 'system',
        tags: ['ai', 'experimental'],
      },
      {
        id: 'real_time_analytics',
        name: '실시간 분석',
        description: '실시간 캠페인 분석 대시보드',
        enabled: true,
        rolloutPercentage: 100,
        targetingRules: [],
        variants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: 'system',
        tags: ['analytics'],
      },
    ]);

    // Online/Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeWsState();
      wsClient.disconnect();
      analytics.destroy();
    };
  }, []);

  const setLocale = async (newLocale: string) => {
    await i18n.setLocale(newLocale);
    setLocaleState(newLocale);
    analytics.track('$locale_changed', { locale: newLocale });
  };

  return {
    isOnline,
    isOfflineReady,
    locale,
    setLocale,
    wsState,
    connectWebSocket,
    disconnectWebSocket,
  };
}

// Inner provider with enterprise features
function InnerProviders({ children }: { children: ReactNode }) {
  const enterpriseState = useEnterpriseInit();

  return (
    <AppContext.Provider value={enterpriseState}>
      {children}
    </AppContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof Error && 'status' in error) {
                const status = (error as Error & { status: number }).status;
                if (status >= 400 && status < 500) return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to analytics
        analytics.track('$error_boundary_triggered', {
          message: error.message,
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ToastProvider>
              <InnerProviders>
                {children}
              </InnerProviders>
            </ToastProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
