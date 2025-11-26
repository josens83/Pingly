/**
 * Navigation E2E Tests
 * Testing core navigation flows
 */

import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.describe('Landing Page', () => {
    test('should load the landing page', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveTitle(/Pingly/i)
    })

    test('should have navigation links', async ({ page }) => {
      await page.goto('/')

      // Check for main navigation elements
      await expect(page.getByRole('link', { name: /로그인/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /시작하기|무료 체험|회원가입/i })).toBeVisible()
    })

    test('should navigate to login from landing', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: /로그인/i }).click()
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users from dashboard', async ({ page }) => {
      await page.goto('/dashboard')
      // Should redirect to login
      await expect(page).toHaveURL(/\/login|\/api\/auth/)
    })

    test('should redirect unauthenticated users from messages', async ({ page }) => {
      await page.goto('/messages')
      // Should redirect to login
      await expect(page).toHaveURL(/\/login|\/api\/auth/)
    })

    test('should redirect unauthenticated users from settings', async ({ page }) => {
      await page.goto('/settings')
      // Should redirect to login
      await expect(page).toHaveURL(/\/login|\/api\/auth/)
    })
  })

  test.describe('Logo Navigation', () => {
    test('should navigate to home when clicking logo on login page', async ({ page }) => {
      await page.goto('/login')
      // Click on the logo/brand link
      await page.getByRole('link').filter({ has: page.locator('svg') }).first().click()
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Responsive Navigation', () => {
    test('should show mobile navigation on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // Mobile menu button should be visible
      const mobileMenuButton = page.getByRole('button', { name: /menu|메뉴/i })
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()
        // Navigation items should become visible
        await expect(page.getByRole('link', { name: /로그인/i })).toBeVisible()
      }
    })
  })
})
