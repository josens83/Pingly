import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { stripe, createCheckoutSession, createCustomer } from '@/lib/stripe'

// POST /api/billing/checkout - Stripe 결제 세션 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { priceId, type } = body // type: 'subscription' or 'credits'

    if (!priceId) {
      return NextResponse.json({ error: '가격 ID가 필요합니다.' }, { status: 400 })
    }

    // 조직의 구독 정보 조회
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: session.user.organizationId },
      include: { organization: true },
    })

    let customerId = subscription?.stripeCustomerId

    // Stripe 고객이 없으면 생성
    if (!customerId) {
      const customer = await createCustomer(
        session.user.email,
        subscription?.organization.name
      )
      customerId = customer.id

      // 구독 정보 업데이트
      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        })
      }
    }

    const baseUrl = process.env.APP_URL || 'http://localhost:3000'

    if (type === 'subscription') {
      // 구독 결제 세션
      const checkoutSession = await createCheckoutSession(
        customerId,
        priceId,
        `${baseUrl}/dashboard/billing?success=true`,
        `${baseUrl}/dashboard/billing?canceled=true`
      )

      return NextResponse.json({ url: checkoutSession.url })
    } else {
      // 크레딧 충전 (일회성 결제)
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/dashboard/billing?success=true&type=credits`,
        cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
        metadata: {
          organizationId: session.user.organizationId,
          type: 'credits',
        },
      })

      return NextResponse.json({ url: checkoutSession.url })
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: '결제 세션 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
