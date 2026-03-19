import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Verify webhook signature from Lemon Squeezy
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') || ''

  // Verify signature
  try {
    if (!verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const eventName = event.meta?.event_name
  const customData = event.meta?.custom_data || {}
  const attrs = event.data?.attributes || {}

  // We pass user email via custom_data or get it from the subscription
  const userEmail = customData.email || attrs.user_email || null
  const planName = attrs.variant_name || attrs.product_name || 'unknown'
  const status = attrs.status // active, cancelled, expired, past_due, etc.
  const subscriptionId = String(event.data?.id || '')

  const supabase = createServerClient()

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
    case 'subscription_resumed': {
      if (!userEmail) break

      // Determine plan from product name
      let plan = 'starter'
      if (planName.toLowerCase().includes('pro')) plan = 'pro'

      const isActive = status === 'active' || status === 'on_trial'

      // Upsert subscription record
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_email: userEmail.toLowerCase(),
          plan,
          status: isActive ? 'active' : status,
          lemon_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_email',
        })

      if (error) console.error('Subscription upsert error:', error)
      break
    }

    case 'subscription_cancelled':
    case 'subscription_expired':
    case 'subscription_paused': {
      if (!userEmail) break

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: eventName === 'subscription_cancelled' ? 'cancelled' : eventName === 'subscription_expired' ? 'expired' : 'paused',
          updated_at: new Date().toISOString(),
        })
        .eq('user_email', userEmail.toLowerCase())

      if (error) console.error('Subscription update error:', error)
      break
    }
  }

  return NextResponse.json({ received: true })
}
