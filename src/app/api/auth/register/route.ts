import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, companyName } = body

    // 필수 필드 검증
    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 12)

    // 조직 slug 생성
    let slug = slugify(companyName)
    let slugExists = await prisma.organization.findUnique({ where: { slug } })
    let counter = 1
    while (slugExists) {
      slug = `${slugify(companyName)}-${counter}`
      slugExists = await prisma.organization.findUnique({ where: { slug } })
      counter++
    }

    // 조직과 사용자 생성 (트랜잭션)
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // 조직 생성
      const organization = await tx.organization.create({
        data: {
          name: companyName,
          slug,
        },
      })

      // 크레딧 잔액 생성 (무료 체험용 100 크레딧)
      await tx.creditBalance.create({
        data: {
          organizationId: organization.id,
          balance: 100,
          bonusBalance: 0,
        },
      })

      // 사용자 생성
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          organizationId: organization.id,
        },
      })

      return { user, organization }
    })

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
