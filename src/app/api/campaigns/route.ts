import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createCampaignSchema = z.object({
  name: z.string().min(1, '캠페인 이름을 입력해주세요'),
  type: z.enum(['SMS', 'LMS', 'MMS', 'RCS', 'KAKAO_ALIMTALK', 'KAKAO_FRIENDTALK']),
  content: z.string().min(1, '메시지 내용을 입력해주세요'),
  mediaUrl: z.string().optional(),
  targetGroupId: z.string().optional(),
  templateId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
})

// GET /api/campaigns - 캠페인 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where = {
      organizationId: session.user.organizationId,
      ...(status && { status: status as any }),
      ...(type && { type: type as any }),
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          targetGroup: true,
          template: true,
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ])

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Campaigns GET error:', error)
    return NextResponse.json({ error: '캠페인 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// POST /api/campaigns - 캠페인 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCampaignSchema.parse(body)

    const campaign = await prisma.campaign.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        content: validatedData.content,
        mediaUrl: validatedData.mediaUrl,
        targetGroupId: validatedData.targetGroupId,
        templateId: validatedData.templateId,
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        status: validatedData.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        organizationId: session.user.organizationId,
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Campaigns POST error:', error)
    return NextResponse.json({ error: '캠페인 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
