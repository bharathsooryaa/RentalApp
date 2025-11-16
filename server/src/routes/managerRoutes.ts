import express from "express";
import {
    getManager,
    createManager
} from '../controllers/managerController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = express.Router();

// Public route for creating manager during signup
router.post("/", createManager);

// Protected routes
router.get("/:cognitoId", authMiddleware(["tenant", "manager"]), getManager);

export default router;
