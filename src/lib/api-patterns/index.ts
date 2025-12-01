/**
 * Advanced API Patterns Module
 *
 * Enterprise-grade API client patterns
 * inspired by Stripe and GitHub.
 */

export {
  createAPIClient,
  pinglyAPI,
  APIError,
  RateLimitError,
  type APIClientConfig,
  type RequestOptions,
  type APIResponse,
  type RateLimitInfo,
  type PaginatedResponse,
  type PaginationOptions,
  type WebhookEvent
} from './APIClient';
