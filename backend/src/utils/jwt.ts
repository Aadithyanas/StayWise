import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRES = '7d';

export interface JwtPayload {
  sub: string; // user id
  email: string; // user email
  role: 'user' | 'admin';
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}


