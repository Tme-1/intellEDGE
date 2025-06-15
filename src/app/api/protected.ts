import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Skip auth check during build time
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    return NextResponse.json({ message: 'Protected content', user: null });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
  return NextResponse.json({ message: 'Protected content', user: payload });
} 