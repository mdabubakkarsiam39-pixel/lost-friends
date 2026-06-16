import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  clerkId?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        clerkId: string;
      };
      req.userId = decoded.userId;
      req.clerkId = decoded.clerkId;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as {
          userId: string;
          clerkId: string;
        };
        req.userId = decoded.userId;
        req.clerkId = decoded.clerkId;
      } catch {
        // Ignore invalid token
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const generateToken = (userId: string, clerkId: string): string => {
  return jwt.sign({ userId, clerkId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string, clerkId: string): string => {
  return jwt.sign({ userId, clerkId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};