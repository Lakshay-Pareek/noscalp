import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: 'organizer' | 'buyer' | 'marketplace';
        iat: number;
    };
}
/**
 * Generate JWT token for user
 */
export declare function generateToken(userId: string, role: 'organizer' | 'buyer' | 'marketplace'): string;
/**
 * Verify JWT token
 */
export declare function verifyToken(token: string): {
    id: string;
    role: string;
    iat: number;
} | null;
/**
 * Middleware: Require valid JWT token
 */
export declare function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
/**
 * Middleware: Require organizer role
 */
export declare function requireOrganizerRole(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
/**
 * Middleware: Require buyer or marketplace role
 */
export declare function requireBuyerOrMarketplaceRole(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export declare function rateLimit(windowMs?: number, maxRequests?: number): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware: Request logging
 */
export declare function requestLogger(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware: Error handler
 */
export declare function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map