import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { secret } = await req.json().catch(() => ({ secret: '' }))
  if (secret !== 'runr-setup-x9k2m-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  // Use Supabase's postgres-meta API (accessible from within their network)
  // Or use the direct pg connection from Vercel's serverless function
  const pg = require('pg')
  const ref = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
  
  // Try multiple connection approaches
  const configs = [
    // Supavisor transaction pooler
    { host: `aws-0-ap-southeast-1.pooler.supabase.com`, port: 6543, user: `postgres.${ref}`, password: process.env.SUPABASE_DB_PASSWORD || serviceKey },
    // Direct connection
    { host: `db.${ref}.supabase.co`, port: 5432, user: 'postgres', password: process.env.SUPABASE_DB_PASSWORD || serviceKey },
    // Alternative pooler regions
    { host: `aws-0-us-east-1.pooler.supabase.com`, port: 6543, user: `postgres.${ref}`, password: process.env.SUPABASE_DB_PASSWORD || serviceKey },
  ]

  let pool: InstanceType<typeof pg.Pool> | null = null
  let connError = ''

  for (const cfg of configs) {
    try {
      const p = new pg.Pool({ ...cfg, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 })
      const c = await p.connect()
      await c.query('SELECT 1')
      c.release()
      pool = p
      break
    } catch (e: unknown) {
      connError += `${cfg.host}:${cfg.port} - ${e instanceof Error ? e.message : String(e)}; `
    }
  }

  if (!pool) {
    return NextResponse.json({ error: `Could not connect to database. Tried: ${connError}` }, { status: 500 })
  }

  const results: string[] = []

  try {
    const client = await pool.connect()
    
    // Create subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.subscriptions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_email TEXT UNIQUE NOT NULL,
        plan TEXT NOT NULL DEFAULT 'starter',
        status TEXT NOT NULL DEFAULT 'active',
        lemon_subscription_id TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    results.push('Created subscriptions table')

    await client.query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON public.subscriptions(user_email)`)
    results.push('Created email index')

    await client.query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status)`)
    results.push('Created status index')

    // Enable RLS
    await client.query(`ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY`)
    results.push('Enabled RLS')

    // Allow service role full access
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Service role full access" ON public.subscriptions
          FOR ALL USING (true) WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `)
    results.push('Created RLS policy')

    // Grant access to service_role and authenticated
    await client.query(`GRANT ALL ON public.subscriptions TO service_role`)
    await client.query(`GRANT SELECT ON public.subscriptions TO authenticated`)
    results.push('Granted permissions')

    client.release()
    await pool.end()

    return NextResponse.json({ success: true, results })
  } catch (err) {
    await pool.end().catch(() => {})
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Unknown error',
      results,
    }, { status: 500 })
  }
}
