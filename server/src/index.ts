import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import { authMiddleware } from './middleware/AuthMiddleware.js';
/*ROUTE IMPORTS*/
import tenantRoutes from './routes/tenantRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

dotenv.config();

const app = express();

/*CONFIGURATIONS*/
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('common'));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

/*ROUTES*/
app.get('/', (req, res) => {
    res.json({
        message: 'Rental App API Server is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            properties: '/api/properties', 
            tenants: '/api/tenants'
        }
    });
});

// API Routes
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes)
app.use("/managers", authMiddleware(["manager"]), managerRoutes)
app.use("/search", searchRoutes) // Public search endpoint

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((error: any, req: any, res: any, next: any) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

/* SERVER */
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`🏠 Properties API: http://localhost:${PORT}/api/properties`);
    console.log(`👥 Tenants API: http://localhost:${PORT}/api/tenants`);
});