import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          // 구독 결제 완료
          const subscriptionId = session.subscription as string
          const customerId = session.customer as string

          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as {
            items: { data: Array<{ price: { id: string } }> }
            current_period_start: number
            current_period_end: number
          }

          await prisma.subscription.update({
            where: { stripeCustomerId: customerId },
            data: {
              stripeSubscriptionId: subscriptionId,
              stripePriceId: stripeSubscription.items.data[0].price.id,
              status: 'ACTIVE',
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            },
          })
        } else if (session.mode === 'payment') {
          // 크레딧 충전
          const organizationId = session.metadata?.organizationId
          const amount = session.amount_total || 0

          if (organizationId) {
            // 크레딧 금액에 따른 크레딧 수 계산 (예: 14원당 1크레딧)
            const credits = Math.floor(amount / 14)

            await prisma.creditBalance.update({
              where: { organizationId },
              data: {
                balance: { increment: credits },
              },
            })

            // 거래 내역 기록
            await prisma.transaction.create({
              data: {
                organizationId,
                type: 'CREDIT_PURCHASE',
                amount,
                credits,
                stripePaymentId: session.payment_intent as string,
                status: 'COMPLETED',
              },
            })
          }
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as unknown as {
          subscription: string | null
          amount_paid: number
          payment_intent: string | null
        }
        const subscriptionId = invoice.subscription

        if (subscriptionId) {
          const subscription = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
            include: { plan: true },
          })

          if (subscription) {
            // 월간 크레딧 리셋
            await prisma.creditBalance.update({
              where: { organizationId: subscription.organizationId },
              data: {
                balance: subscription.plan.monthlyCredits,
                lastResetAt: new Date(),
              },
            })

            // 거래 내역 기록
            await prisma.transaction.create({
              data: {
                organizationId: subscription.organizationId,
                type: 'SUBSCRIPTION',
                amount: invoice.amount_paid,
                credits: subscription.plan.monthlyCredits,
                stripePaymentId: invoice.payment_intent || '',
                status: 'COMPLETED',
              },
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as unknown as { id: string }

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as {
          id: string
          status: string
          cancel_at_period_end: boolean
          current_period_end: number
        }

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
