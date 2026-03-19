import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Create integration_links table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS integration_links (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          platform TEXT NOT NULL,
          connect_code TEXT NOT NULL UNIQUE,
          chat_id TEXT,
          username TEXT,
          user_id TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT now(),
          linked_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS idx_integration_links_code ON integration_links(connect_code);
        CREATE INDEX IF NOT EXISTS idx_integration_links_platform ON integration_links(platform, status);
      `
    })

    if (error) {
      // Table might already exist, try direct insert test
      const { error: testError } = await supabase
        .from('integration_links')
        .select('id')
        .limit(1)

      if (testError) {
        return NextResponse.json({ 
          error: 'Table does not exist. Please create it manually in Supabase dashboard.',
          sql: `CREATE TABLE integration_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  connect_code TEXT NOT NULL UNIQUE,
  chat_id TEXT,
  username TEXT,
  user_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  linked_at TIMESTAMPTZ
);`,
          details: testError.message 
        }, { status: 500 })
      }

      return NextResponse.json({ status: 'Table already exists', ok: true })
    }

    return NextResponse.json({ status: 'Migration complete', ok: true })
  } catch (err) {
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Migration failed' 
    }, { status: 500 })
  }
}
