/**
 * Authentication E2E Tests
 * Critical user flows for login and registration
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('should display login form', async ({ page }) => {
      // Check page title/heading
      await expect(page.getByRole('heading', { name: /다시 오신 것을 환영합니다/i })).toBeVisible()

      // Check form elements
      await expect(page.getByLabel(/이메일/i)).toBeVisible()
      await expect(page.getByLabel(/비밀번호/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /로그인/i })).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
      // Click submit without filling form
      await page.getByRole('button', { name: /로그인/i }).click()

      // Check for validation errors
      await expect(page.getByText(/유효한 이메일을 입력해주세요/i)).toBeVisible()
    })

    test('should show validation error for invalid email', async ({ page }) => {
      await page.getByLabel(/이메일/i).fill('invalid-email')
      await page.getByLabel(/비밀번호/i).fill('password123')
      await page.getByRole('button', { name: /로그인/i }).click()

      await expect(page.getByText(/유효한 이메일을 입력해주세요/i)).toBeVisible()
    })

    test('should navigate to registration page', async ({ page }) => {
      await page.getByRole('link', { name: /회원가입/i }).click()
      await expect(page).toHaveURL('/register')
    })

    test('should navigate to forgot password page', async ({ page }) => {
      await page.getByRole('link', { name: /비밀번호 찾기/i }).click()
      await expect(page).toHaveURL('/forgot-password')
    })

    test('should have Google login option', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Google로 로그인/i })).toBeVisible()
    })
  })

  test.describe('Registration Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register')
    })

    test('should display registration form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /회원가입/i })).toBeVisible()
      await expect(page.getByLabel(/이름/i)).toBeVisible()
      await expect(page.getByLabel(/회사\/조직명/i)).toBeVisible()
      await expect(page.getByLabel(/이메일/i)).toBeVisible()
    })

    test('should show validation errors for empty required fields', async ({ page }) => {
      await page.getByRole('button', { name: /무료로 시작하기/i }).click()

      await expect(page.getByText(/이름은 2자 이상이어야 합니다/i)).toBeVisible()
    })

    test('should validate password confirmation', async ({ page }) => {
      await page.getByLabel(/^이름$/i).fill('홍길동')
      await page.getByLabel(/회사\/조직명/i).fill('테스트 회사')
      await page.getByLabel(/^이메일$/i).fill('test@example.com')
      await page.getByLabel(/^비밀번호$/i).fill('password123')
      await page.getByLabel(/비밀번호 확인/i).fill('differentpassword')

      await page.getByRole('button', { name: /무료로 시작하기/i }).click()

      await expect(page.getByText(/비밀번호가 일치하지 않습니다/i)).toBeVisible()
    })

    test('should validate password length', async ({ page }) => {
      await page.getByLabel(/^이름$/i).fill('홍길동')
      await page.getByLabel(/회사\/조직명/i).fill('테스트 회사')
      await page.getByLabel(/^이메일$/i).fill('test@example.com')
      await page.getByLabel(/^비밀번호$/i).fill('short')
      await page.getByLabel(/비밀번호 확인/i).fill('short')

      await page.getByRole('button', { name: /무료로 시작하기/i }).click()

      await expect(page.getByText(/비밀번호는 8자 이상이어야 합니다/i)).toBeVisible()
    })

    test('should navigate to login page', async ({ page }) => {
      await page.getByRole('link', { name: /로그인/i }).click()
      await expect(page).toHaveURL('/login')
    })

    test('should show 14-day free trial badge', async ({ page }) => {
      await expect(page.getByText(/14일 무료/i)).toBeVisible()
    })

    test('should display benefits on larger screens', async ({ page }) => {
      // Set viewport to desktop size
      await page.setViewportSize({ width: 1280, height: 720 })

      await expect(page.getByText(/월 1,000 크레딧 제공/i)).toBeVisible()
      await expect(page.getByText(/SMS, LMS, MMS 발송/i)).toBeVisible()
    })
  })
})
