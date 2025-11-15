"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const auth_1 = require("./middleware/auth");
const tickets_1 = __importDefault(require("./routes/tickets"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(auth_1.requestLogger);
app.use((0, auth_1.rateLimit)(60000, 100)); // 100 requests per minute
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/tickets', tickets_1.default);
// Error handler
app.use(auth_1.errorHandler);
// Initialize and start server
async function start() {
    try {
        await (0, db_1.initializeDatabase)();
        console.log('Database initialized');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await (0, db_1.closeDatabase)();
    process.exit(0);
});
start();
//# sourceMappingURL=index.js.map