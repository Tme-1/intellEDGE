import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, signJwt } from '@/lib/auth';
import { users } from './usersStore';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }
  const user = users[email];
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = signJwt({ email });
  return NextResponse.json({ token });
} 