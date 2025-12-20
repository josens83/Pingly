'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/primitives';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      // Redirect to home when back online
      window.location.href = '/';
    }
  }, [isOnline]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <WifiOff className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          오프라인 상태입니다
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          인터넷 연결이 끊어졌습니다.
          <br />
          네트워크 연결을 확인하고 다시 시도해 주세요.
        </p>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span
            className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}
          />
          <span className="text-sm text-gray-500">
            {isOnline ? '온라인' : '오프라인'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleRetry}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </Button>

          <Button
            variant="outline"
            onClick={handleGoHome}
            className="inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            홈으로 이동
          </Button>
        </div>

        {/* Cached Content Notice */}
        <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>알림:</strong> 오프라인 상태에서도 이전에 방문한 페이지의
            일부 데이터를 볼 수 있습니다.
          </p>
        </div>

        {/* PWA Install Prompt */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            Pingly 앱을 설치하면 오프라인에서도 더 많은 기능을 사용할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
