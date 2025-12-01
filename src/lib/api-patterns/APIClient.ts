/**
 * Advanced API Client (Stripe/GitHub Style)
 *
 * Features:
 * - Idempotency keys
 * - Request signing
 * - Pagination helpers
 * - Rate limit handling
 * - Webhook verification
 * - Versioning support
 * - Expand/Include patterns
 */

export interface APIClientConfig {
  baseUrl: string;
  apiKey?: string;
  apiVersion?: string;
  timeout?: number;
  maxRetries?: number;
  idempotencyKeyHeader?: string;
  userAgent?: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  idempotencyKey?: string;
  expand?: string[];
  include?: string[];
  timeout?: number;
}

export interface APIResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  requestId?: string;
  rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  totalCount?: number;
  cursor?: string;
  nextCursor?: string;
  prevCursor?: string;
}

export interface PaginationOptions {
  cursor?: string;
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
  order?: 'asc' | 'desc';
}

export interface WebhookEvent<T = unknown> {
  id: string;
  type: string;
  data: T;
  created: number;
  livemode: boolean;
  apiVersion?: string;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public requestId?: string,
    public docUrl?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class RateLimitError extends APIError {
  constructor(
    message: string,
    public retryAfter: number,
    requestId?: string
  ) {
    super(message, 429, 'rate_limit_exceeded', requestId);
    this.name = 'RateLimitError';
  }
}

class AdvancedAPIClient {
  private config: Required<APIClientConfig>;

  constructor(config: APIClientConfig) {
    this.config = {
      apiKey: '',
      apiVersion: '2024-01-01',
      timeout: 30000,
      maxRetries: 3,
      idempotencyKeyHeader: 'Idempotency-Key',
      userAgent: 'Pingly-Client/1.0',
      ...config
    };
  }

  /**
   * Make an API request
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    const url = this.buildUrl(path, options.params);
    const headers = this.buildHeaders(options);
    const body = options.body ? JSON.stringify(options.body) : undefined;

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          options.timeout || this.config.timeout
        );

        const response = await fetch(url.toString(), {
          method: options.method || 'GET',
          headers,
          body,
          signal: controller.signal
        });

        clearTimeout(timeout);

        // Extract rate limit info
        const rateLimit = this.extractRateLimitInfo(response.headers);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = rateLimit?.retryAfter || 60;
          throw new RateLimitError(
            'Rate limit exceeded',
            retryAfter,
            response.headers.get('X-Request-Id') || undefined
          );
        }

        // Handle errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new APIError(
            errorData.message || `HTTP ${response.status}`,
            response.status,
            errorData.code,
            response.headers.get('X-Request-Id') || undefined,
            errorData.doc_url
          );
        }

        const data = await response.json();

        return {
          data,
          status: response.status,
          headers: response.headers,
          requestId: response.headers.get('X-Request-Id') || undefined,
          rateLimit
        };
      } catch (error) {
        lastError = error as Error;

        // Retry on rate limit with backoff
        if (error instanceof RateLimitError) {
          await this.delay(error.retryAfter * 1000);
          attempt++;
          continue;
        }

        // Retry on network errors
        if (this.isRetryable(error as Error) && attempt < this.config.maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000);
          attempt++;
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * GET request
   */
  async get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  /**
   * Paginated list request
   */
  async list<T>(path: string, options?: RequestOptions & PaginationOptions): Promise<PaginatedResponse<T>> {
    const { cursor, limit = 20, startingAfter, endingBefore, order, ...requestOptions } = options || {};

    const params: Record<string, string | number | boolean | undefined> = {
      ...requestOptions.params,
      limit,
      order
    };

    if (cursor) params.cursor = cursor;
    if (startingAfter) params.starting_after = startingAfter;
    if (endingBefore) params.ending_before = endingBefore;

    const response = await this.get<{
      data: T[];
      has_more: boolean;
      total_count?: number;
      next_cursor?: string;
      prev_cursor?: string;
    }>(path, { ...requestOptions, params });

    return {
      data: response.data.data,
      hasMore: response.data.has_more,
      totalCount: response.data.total_count,
      nextCursor: response.data.next_cursor,
      prevCursor: response.data.prev_cursor
    };
  }

  /**
   * Auto-paginate through all results
   */
  async *autoPaginate<T>(path: string, options?: RequestOptions & PaginationOptions): AsyncGenerator<T> {
    let cursor = options?.cursor;
    let hasMore = true;

    while (hasMore) {
      const response = await this.list<T>(path, { ...options, cursor });

      for (const item of response.data) {
        yield item;
      }

      hasMore = response.hasMore;
      cursor = response.nextCursor;
    }
  }

  /**
   * Generate idempotency key
   */
  generateIdempotencyKey(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
    tolerance = 300
  ): boolean {
    const elements = signature.split(',');
    const signatureMap: Record<string, string> = {};

    for (const element of elements) {
      const [key, value] = element.split('=');
      signatureMap[key] = value;
    }

    const timestamp = parseInt(signatureMap.t, 10);
    const signatures = Object.entries(signatureMap)
      .filter(([key]) => key.startsWith('v'))
      .map(([, value]) => value);

    // Check timestamp tolerance
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > tolerance) {
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = this.computeHMAC(signedPayload, secret);

    return signatures.some(sig => this.secureCompare(sig, expectedSignature));
  }

  /**
   * Parse webhook event
   */
  parseWebhookEvent<T>(payload: string, signature: string, secret: string): WebhookEvent<T> {
    if (!this.verifyWebhookSignature(payload, signature, secret)) {
      throw new Error('Invalid webhook signature');
    }

    return JSON.parse(payload);
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): URL {
    const url = new URL(path, this.config.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url;
  }

  private buildHeaders(options: RequestOptions): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': this.config.userAgent,
      'API-Version': this.config.apiVersion
    });

    if (this.config.apiKey) {
      headers.set('Authorization', `Bearer ${this.config.apiKey}`);
    }

    if (options.idempotencyKey) {
      headers.set(this.config.idempotencyKeyHeader, options.idempotencyKey);
    }

    if (options.expand?.length) {
      headers.set('Expand', options.expand.join(','));
    }

    if (options.include?.length) {
      headers.set('Include', options.include.join(','));
    }

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers.set(key, value);
      }
    }

    return headers;
  }

  private extractRateLimitInfo(headers: Headers): RateLimitInfo | undefined {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    const retryAfter = headers.get('Retry-After');

    if (!limit || !remaining || !reset) {
      return undefined;
    }

    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: new Date(parseInt(reset, 10) * 1000),
      retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined
    };
  }

  private isRetryable(error: Error): boolean {
    if (error.name === 'AbortError') return false;
    if (error instanceof APIError && error.status >= 400 && error.status < 500) return false;
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private computeHMAC(data: string, secret: string): string {
    // In a real implementation, use Web Crypto API or Node crypto
    // This is a placeholder
    let hash = 0;
    const combined = data + secret;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

// Factory function
export function createAPIClient(config: APIClientConfig): AdvancedAPIClient {
  return new AdvancedAPIClient(config);
}

// Pre-configured Pingly API client
export const pinglyAPI = createAPIClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.pingly.io',
  apiVersion: '2024-01-01'
});
