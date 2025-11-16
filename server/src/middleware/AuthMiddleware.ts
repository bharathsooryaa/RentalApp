import type { NextFunction, Request, Response } from 'express';
import { supabase } from '../utils/supabaseClient.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (
  allowedRoles: string[]
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization?.split(" ");
            
            if (!authHeader || authHeader.length !== 2 || authHeader[0] !== 'Bearer') {
                return res.status(401).json({ error: 'Invalid authorization header format' });
            }
            
            const token = authHeader[1];
            
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            
            // Verify the Supabase JWT token
            const { data: { user }, error } = await supabase.auth.getUser(token);
            
            if (error || !user) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
            
            // Extract user role from app_metadata
            const userRole = user.app_metadata?.role;
            
            if (!userRole) {
                return res.status(401).json({ error: 'User role not found in token' });
            }
            
            // Check if user role is allowed
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            // Attach user info to request
            req.user = {
                id: user.id, // This is the Supabase user ID (stored as cognito_id in DB)
                role: userRole
            };
            
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}