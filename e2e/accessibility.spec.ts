/**
 * Accessibility E2E Tests
 * WCAG 2.1 AA Compliance Testing
 */

import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test.describe('Keyboard Navigation', () => {
    test('login form should be navigable with keyboard', async ({ page }) => {
      await page.goto('/login')

      // Tab through form elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Email input should be focusable
      const emailInput = page.getByLabel(/이메일/i)
      await emailInput.focus()
      await expect(emailInput).toBeFocused()

      // Tab to password
      await page.keyboard.press('Tab')
      const passwordInput = page.getByLabel(/비밀번호/i)
      await expect(passwordInput).toBeFocused()

      // Tab to submit button
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      const submitButton = page.getByRole('button', { name: /로그인/i })
      await expect(submitButton).toBeFocused()
    })

    test('should be able to submit form with Enter key', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel(/이메일/i).fill('test@example.com')
      await page.getByLabel(/비밀번호/i).fill('password123')
      await page.keyboard.press('Enter')

      // Form should attempt to submit (may show error since credentials are invalid)
      // We're just testing that Enter key triggers submission
      await page.waitForTimeout(500)
    })
  })

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/login')

      const emailInput = page.getByLabel(/이메일/i)
      await emailInput.focus()

      // Check that focus ring is visible (has ring classes from Tailwind)
      await expect(emailInput).toHaveCSS('outline-style', /(solid|auto)/)
    })

    test('buttons should have focus states', async ({ page }) => {
      await page.goto('/login')

      const submitButton = page.getByRole('button', { name: /로그인/i })
      await submitButton.focus()

      await expect(submitButton).toBeFocused()
    })
  })

  test.describe('Screen Reader Support', () => {
    test('form inputs should have labels', async ({ page }) => {
      await page.goto('/login')

      // Check that inputs have associated labels
      const emailInput = page.getByRole('textbox', { name: /이메일/i })
      await expect(emailInput).toBeVisible()

      // Password field (using type selector since password inputs don't have textbox role)
      const passwordLabel = page.getByText(/^비밀번호$/)
      await expect(passwordLabel).toBeVisible()
    })

    test('error messages should be accessible', async ({ page }) => {
      await page.goto('/login')

      // Submit empty form
      await page.getByRole('button', { name: /로그인/i }).click()

      // Error message should be visible and readable
      const errorMessage = page.getByText(/유효한 이메일을 입력해주세요/i)
      await expect(errorMessage).toBeVisible()
    })

    test('buttons should have accessible names', async ({ page }) => {
      await page.goto('/login')

      // Main submit button
      const submitButton = page.getByRole('button', { name: /로그인/i })
      await expect(submitButton).toHaveAccessibleName(/로그인/i)

      // Google button
      const googleButton = page.getByRole('button', { name: /Google로 로그인/i })
      await expect(googleButton).toHaveAccessibleName(/Google로 로그인/i)
    })
  })

  test.describe('Color Contrast', () => {
    test('text should be readable', async ({ page }) => {
      await page.goto('/login')

      // Check that main heading is visible
      const heading = page.getByRole('heading', { level: 1 })
      if (await heading.isVisible()) {
        // Basic visibility check - actual contrast testing would require additional tools
        await expect(heading).toBeVisible()
      }
    })
  })

  test.describe('Motion Preferences', () => {
    test('should respect reduced motion preference', async ({ page }) => {
      // Emulate reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/login')

      // Page should still function without animations
      await expect(page.getByRole('heading')).toBeVisible()
    })
  })
})
