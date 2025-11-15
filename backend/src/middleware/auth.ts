import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'organizer' | 'buyer' | 'marketplace';
    iat: number;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

/**
 * Generate JWT token for user
 */
export function generateToken(userId: string, role: 'organizer' | 'buyer' | 'marketplace'): string {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    JWT_SECRET,
    {
      expiresIn: '24h',
    }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { id: string; role: string; iat: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      role: decoded.role,
      iat: decoded.iat,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Middleware: Require valid JWT token
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH] Missing or invalid header:', authHeader);
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.substring(7);
  console.log('[AUTH] Verifying token...');
  const decoded = verifyToken(token);

  if (!decoded) {
    console.log('[AUTH] Token verification failed');
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  console.log('[AUTH] Token verified for user:', decoded.id, 'role:', decoded.role);
  req.user = decoded as any;
  next();
}

/**
 * Middleware: Require organizer role
 */
export function requireOrganizerRole(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'organizer') {
    res.status(403).json({ error: 'Organizer role required' });
    return;
  }

  next();
}

/**
 * Middleware: Require buyer or marketplace role
 */
export function requireBuyerOrMarketplaceRole(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || (req.user.role !== 'buyer' && req.user.role !== 'marketplace')) {
    res.status(403).json({ error: 'Buyer or marketplace role required' });
    return;
  }

  next();
}

/**
 * Middleware: Rate limiting (simple in-memory implementation)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(windowMs: number = 60000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(key, record);
    }

    record.count++;

    if (record.count > maxRequests) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    next();
  };
}

/**
 * Middleware: Request logging
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}

/**
 * Middleware: Error handler
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}
