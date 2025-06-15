import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { users, User } from './usersStore';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }
  if (users[email]) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
  const hashed = await hashPassword(password);
  users[email] = { email, password: hashed, courses: [], cgpa: 0 };
  return NextResponse.json({ message: 'User registered successfully' });
} 