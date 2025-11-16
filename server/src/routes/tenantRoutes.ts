import express from 'express';
import {
    getTenant,
    createTenant
} from '../controllers/tenantController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = express.Router();

// Public route for creating tenant during signup
router.post("/", createTenant);

// Protected routes
router.get("/:cognitoId", authMiddleware(["tenant", "manager"]), getTenant);

export default router;