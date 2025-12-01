/**
 * Input Validation
 * Comprehensive validation utilities
 */

import { z } from 'zod'

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Array<{
    field: string
    message: string
  }>
}

/**
 * Validate input against a schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return {
      success: true,
      data: result.data,
    }
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  }
}

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  // Email
  email: z.string().email('유효한 이메일을 입력해주세요'),

  // Password (8+ chars, 1 uppercase, 1 lowercase, 1 number)
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/[A-Z]/, '대문자를 포함해야 합니다')
    .regex(/[a-z]/, '소문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다'),

  // Simple password (8+ chars)
  simplePassword: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),

  // Korean phone number
  phoneNumber: z
    .string()
    .regex(/^01[0-9]{8,9}$/, '유효한 휴대폰 번호를 입력해주세요'),

  // Korean name
  name: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(50, '이름은 50자 이하여야 합니다'),

  // Company name
  companyName: z
    .string()
    .min(1, '회사명을 입력해주세요')
    .max(100, '회사명은 100자 이하여야 합니다'),

  // SMS content (80 bytes for SMS, 2000 for LMS)
  smsContent: z
    .string()
    .min(1, '메시지 내용을 입력해주세요')
    .max(80, 'SMS는 80자 이하여야 합니다'),

  lmsContent: z
    .string()
    .min(1, '메시지 내용을 입력해주세요')
    .max(2000, 'LMS는 2000자 이하여야 합니다'),

  // URL
  url: z.string().url('유효한 URL을 입력해주세요'),

  // UUID
  uuid: z.string().uuid('유효한 ID 형식이 아닙니다'),

  // Positive integer
  positiveInt: z.number().int().positive('양의 정수를 입력해주세요'),

  // Date
  date: z.coerce.date(),

  // Date string (YYYY-MM-DD)
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다'),

  // Time string (HH:MM)
  timeString: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식이 올바르지 않습니다'),
}

/**
 * Create a validated API handler wrapper
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (data: T) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await request.json()
      const result = validateInput(schema, body)

      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: result.errors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      return handler(result.data!)
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }
}

/**
 * Common form schemas
 */
export const FormSchemas = {
  login: z.object({
    email: ValidationSchemas.email,
    password: z.string().min(1, '비밀번호를 입력해주세요'),
  }),

  register: z
    .object({
      name: ValidationSchemas.name,
      email: ValidationSchemas.email,
      password: ValidationSchemas.simplePassword,
      confirmPassword: z.string(),
      companyName: ValidationSchemas.companyName,
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: '비밀번호가 일치하지 않습니다',
      path: ['confirmPassword'],
    }),

  sendMessage: z.object({
    type: z.enum(['SMS', 'LMS', 'MMS', 'KAKAO']),
    content: z.string().min(1, '메시지 내용을 입력해주세요'),
    recipients: z.array(ValidationSchemas.phoneNumber).min(1, '수신자를 선택해주세요'),
    scheduledAt: z.coerce.date().optional(),
  }),

  contact: z.object({
    name: ValidationSchemas.name,
    phone: ValidationSchemas.phoneNumber,
    email: ValidationSchemas.email.optional(),
    tags: z.array(z.string()).optional(),
  }),

  profile: z.object({
    name: ValidationSchemas.name,
    companyName: ValidationSchemas.companyName,
    phone: ValidationSchemas.phoneNumber.optional(),
  }),

  passwordChange: z
    .object({
      currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
      newPassword: ValidationSchemas.simplePassword,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: '새 비밀번호가 일치하지 않습니다',
      path: ['confirmPassword'],
    }),
}
