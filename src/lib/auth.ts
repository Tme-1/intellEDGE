import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('JWT_SECRET environment variable is missing in production');
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: object): string {
  if (!JWT_SECRET) {
    console.warn('JWT_SECRET is not configured');
    return '';
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function verifyJwt(token: string): any {
  if (!JWT_SECRET) {
    console.warn('JWT_SECRET is not configured');
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
} 