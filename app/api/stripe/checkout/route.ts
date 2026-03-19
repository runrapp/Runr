import { NextRequest, NextResponse } from 'next/server'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  try {
    const { plan, email } = await req.json()

    const prices: Record<string, number> = {
      starter: 2500,
      pro: 7500,
    }

    const priceAmount = prices[plan]
    if (!priceAmount) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runr.site'

    const params = new URLSearchParams()
    params.append('mode', 'subscription')
    params.append('success_url', `${appUrl}/dashboard/integrations?subscribed=${plan}`)
    params.append('cancel_url', `${appUrl}/#pricing`)
    params.append('line_items[0][price_data][currency]', 'usd')
    params.append('line_items[0][price_data][product_data][name]', `Runr ${plan.charAt(0).toUpperCase() + plan.slice(1)}`)
    params.append('line_items[0][price_data][unit_amount]', String(priceAmount))
    params.append('line_items[0][price_data][recurring][interval]', 'month')
    params.append('line_items[0][quantity]', '1')
    if (email) params.append('customer_email', email)

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const session = await res.json()
    if (session.error) return NextResponse.json({ error: session.error.message }, { status: 400 })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Checkout failed' }, { status: 500 })
  }
}
