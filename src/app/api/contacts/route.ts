import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createContactSchema = z.object({
  phone: z.string().min(10, '전화번호를 입력해주세요'),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().optional(),
  tags: z.array(z.string()).optional(),
  optInStatus: z.boolean().default(true),
})

// GET /api/contacts - 연락처 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const groupId = searchParams.get('groupId')

    const where = {
      organizationId: session.user.organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(groupId && {
        groups: {
          some: { groupId },
        },
      }),
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          groups: {
            include: {
              group: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ])

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Contacts GET error:', error)
    return NextResponse.json({ error: '연락처 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// POST /api/contacts - 연락처 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createContactSchema.parse(body)

    // 중복 확인
    const existing = await prisma.contact.findUnique({
      where: {
        organizationId_phone: {
          organizationId: session.user.organizationId,
          phone: validatedData.phone,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: '이미 등록된 전화번호입니다.' }, { status: 400 })
    }

    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        organizationId: session.user.organizationId,
        optInDate: validatedData.optInStatus ? new Date() : null,
      },
    })

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Contacts POST error:', error)
    return NextResponse.json({ error: '연락처 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
