"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.requireAuth = requireAuth;
exports.requireOrganizerRole = requireOrganizerRole;
exports.requireBuyerOrMarketplaceRole = requireBuyerOrMarketplaceRole;
exports.rateLimit = rateLimit;
exports.requestLogger = requestLogger;
exports.errorHandler = errorHandler;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
/**
 * Generate JWT token for user
 */
function generateToken(userId, role) {
    return jsonwebtoken_1.default.sign({
        id: userId,
        role,
    }, JWT_SECRET, {
        expiresIn: '24h',
    });
}
/**
 * Verify JWT token
 */
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return {
            id: decoded.id,
            role: decoded.role,
            iat: decoded.iat,
        };
    }
    catch (error) {
        return null;
    }
}
/**
 * Middleware: Require valid JWT token
 */
function requireAuth(req, res, next) {
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
    req.user = decoded;
    next();
}
/**
 * Middleware: Require organizer role
 */
function requireOrganizerRole(req, res, next) {
    if (!req.user || req.user.role !== 'organizer') {
        res.status(403).json({ error: 'Organizer role required' });
        return;
    }
    next();
}
/**
 * Middleware: Require buyer or marketplace role
 */
function requireBuyerOrMarketplaceRole(req, res, next) {
    if (!req.user || (req.user.role !== 'buyer' && req.user.role !== 'marketplace')) {
        res.status(403).json({ error: 'Buyer or marketplace role required' });
        return;
    }
    next();
}
/**
 * Middleware: Rate limiting (simple in-memory implementation)
 */
const rateLimitStore = new Map();
function rateLimit(windowMs = 60000, maxRequests = 100) {
    return (req, res, next) => {
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
function requestLogger(req, res, next) {
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
function errorHandler(error, req, res, next) {
    console.error('Error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
}
//# sourceMappingURL=auth.js.map