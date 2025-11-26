/**
 * OpenAPI Specification for Pingly API
 * Version 1.0.0
 */

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Pingly API',
    description: `
# Pingly SMS & Messenger Marketing Platform API

Pingly는 SMS, LMS, MMS 및 카카오 알림톡 발송을 위한 통합 메시지 마케팅 플랫폼입니다.

## 인증
모든 API 요청은 Bearer 토큰 인증이 필요합니다.

\`\`\`
Authorization: Bearer <your-api-token>
\`\`\`

## 응답 형식
모든 응답은 JSON 형식으로 반환됩니다.

## 에러 처리
에러 응답은 다음과 같은 형식을 따릅니다:

\`\`\`json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": {}
}
\`\`\`
    `,
    version: '1.0.0',
    contact: {
      name: 'Pingly Support',
      email: 'support@pingly.kr',
      url: 'https://pingly.kr/support',
    },
    license: {
      name: 'Proprietary',
      url: 'https://pingly.kr/terms',
    },
  },
  servers: [
    {
      url: 'https://api.pingly.kr/v1',
      description: 'Production Server',
    },
    {
      url: 'https://api-staging.pingly.kr/v1',
      description: 'Staging Server',
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development Server',
    },
  ],
  tags: [
    {
      name: 'auth',
      description: '인증 관련 API',
    },
    {
      name: 'messages',
      description: '메시지 발송 및 관리 API',
    },
    {
      name: 'contacts',
      description: '연락처 관리 API',
    },
    {
      name: 'templates',
      description: '메시지 템플릿 관리 API',
    },
    {
      name: 'analytics',
      description: '분석 및 통계 API',
    },
    {
      name: 'billing',
      description: '결제 및 크레딧 관리 API',
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['auth'],
        summary: '회원가입',
        description: '새로운 사용자 계정을 생성합니다.',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: '회원가입 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '409': {
            description: '이미 존재하는 이메일',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['auth'],
        summary: '로그인',
        description: '이메일과 비밀번호로 로그인합니다.',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },
          '401': {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/messages': {
      get: {
        tags: ['messages'],
        summary: '메시지 목록 조회',
        description: '발송된 메시지 목록을 조회합니다.',
        operationId: 'getMessages',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: '페이지 번호',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
            description: '페이지당 항목 수',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED'],
            },
            description: '메시지 상태 필터',
          },
          {
            name: 'type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['SMS', 'LMS', 'MMS', 'KAKAO'],
            },
            description: '메시지 유형 필터',
          },
        ],
        responses: {
          '200': {
            description: '메시지 목록',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageListResponse',
                },
              },
            },
          },
          '401': {
            description: '인증 필요',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['messages'],
        summary: '메시지 발송',
        description: '새로운 메시지를 발송합니다.',
        operationId: 'sendMessage',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SendMessageRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: '메시지 발송 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Message',
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '402': {
            description: '크레딧 부족',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/messages/{id}': {
      get: {
        tags: ['messages'],
        summary: '메시지 상세 조회',
        description: '특정 메시지의 상세 정보를 조회합니다.',
        operationId: 'getMessage',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '메시지 ID',
          },
        ],
        responses: {
          '200': {
            description: '메시지 상세 정보',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Message',
                },
              },
            },
          },
          '404': {
            description: '메시지를 찾을 수 없음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/contacts': {
      get: {
        tags: ['contacts'],
        summary: '연락처 목록 조회',
        description: '저장된 연락처 목록을 조회합니다.',
        operationId: 'getContacts',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
          },
          {
            name: 'group',
            in: 'query',
            schema: { type: 'string' },
            description: '그룹 ID로 필터',
          },
        ],
        responses: {
          '200': {
            description: '연락처 목록',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ContactListResponse',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['contacts'],
        summary: '연락처 추가',
        description: '새로운 연락처를 추가합니다.',
        operationId: 'createContact',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateContactRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: '연락처 추가 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Contact',
                },
              },
            },
          },
        },
      },
    },
    '/analytics/overview': {
      get: {
        tags: ['analytics'],
        summary: '분석 개요',
        description: '메시지 발송 분석 개요를 조회합니다.',
        operationId: 'getAnalyticsOverview',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: '시작 날짜 (YYYY-MM-DD)',
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: '종료 날짜 (YYYY-MM-DD)',
          },
        ],
        responses: {
          '200': {
            description: '분석 개요',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AnalyticsOverview',
                },
              },
            },
          },
        },
      },
    },
    '/billing/credits': {
      get: {
        tags: ['billing'],
        summary: '크레딧 조회',
        description: '현재 크레딧 잔액을 조회합니다.',
        operationId: 'getCredits',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: '크레딧 정보',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Credits',
                },
              },
            },
          },
        },
      },
    },
    '/billing/purchase': {
      post: {
        tags: ['billing'],
        summary: '크레딧 구매',
        description: '크레딧을 구매합니다.',
        operationId: 'purchaseCredits',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PurchaseCreditsRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: '결제 세션',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionUrl: {
                      type: 'string',
                      description: '결제 페이지 URL',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'object' },
        },
        required: ['error'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          companyName: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          credits: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string', minLength: 2 },
          companyName: { type: 'string' },
        },
        required: ['email', 'password', 'name', 'companyName'],
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['SMS', 'LMS', 'MMS', 'KAKAO'] },
          content: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED'] },
          recipientCount: { type: 'integer' },
          sentAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SendMessageRequest: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['SMS', 'LMS', 'MMS', 'KAKAO'] },
          content: { type: 'string', maxLength: 2000 },
          recipients: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
          },
          scheduledAt: { type: 'string', format: 'date-time' },
          templateId: { type: 'string' },
        },
        required: ['type', 'content', 'recipients'],
      },
      MessageListResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Message' },
          },
          pagination: { $ref: '#/components/schemas/Pagination' },
        },
      },
      Contact: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          tags: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateContactRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'phone'],
      },
      ContactListResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Contact' },
          },
          pagination: { $ref: '#/components/schemas/Pagination' },
        },
      },
      AnalyticsOverview: {
        type: 'object',
        properties: {
          totalSent: { type: 'integer' },
          totalDelivered: { type: 'integer' },
          deliveryRate: { type: 'number' },
          creditsUsed: { type: 'integer' },
          messagesByType: {
            type: 'object',
            additionalProperties: { type: 'integer' },
          },
          dailyStats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date' },
                sent: { type: 'integer' },
                delivered: { type: 'integer' },
              },
            },
          },
        },
      },
      Credits: {
        type: 'object',
        properties: {
          balance: { type: 'integer' },
          usedThisMonth: { type: 'integer' },
          plan: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
      PurchaseCreditsRequest: {
        type: 'object',
        properties: {
          amount: {
            type: 'integer',
            enum: [1000, 5000, 10000, 50000],
          },
        },
        required: ['amount'],
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
    },
  },
}
