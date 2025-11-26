/**
 * Test Utilities
 * Common utilities and custom render for testing
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

function customRender(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...options }: CustomRenderOptions = {}
) {
  function AllProviders({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Override render with custom render
export { customRender as render }

// Helper functions
export const createMockSession = (overrides = {}) => ({
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    role: 'USER',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: new Date().toISOString(),
  image: null,
  role: 'USER',
  credits: 1000,
  companyName: 'Test Company',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockMessage = (overrides = {}) => ({
  id: 'test-message-id',
  type: 'SMS',
  content: 'Test message content',
  status: 'SENT',
  recipientCount: 100,
  sentAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  ...overrides,
})

// Wait for async operations
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0))

// Mock API response helper
export const mockApiResponse = <T,>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
})

// Mock fetch
export const mockFetch = (response: unknown, status = 200) => {
  return jest.fn().mockResolvedValue(mockApiResponse(response, status))
}
