/**
 * Progressive Web App (PWA) Module
 *
 * Complete PWA implementation for Pingly.
 */

export {
  pwa,
  useInstallPrompt,
  useOnlineStatus,
  useDisplayMode,
  type BeforeInstallPromptEvent,
  type PWAConfig,
  type DisplayMode,
  type InstallState,
  type PushSubscriptionData
} from './PWAManager';

export {
  generateManifest,
  generateManifestJSON,
  defaultManifest,
  type WebAppManifest,
  type ManifestIcon,
  type ManifestShortcut,
  type ManifestScreenshot
} from './manifest';
