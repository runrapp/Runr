import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'Auth endpoint active',
    providers: ['email', 'google'],
  })
}
