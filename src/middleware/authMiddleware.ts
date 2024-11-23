import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../config/fireauth';

// Auth middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split('Bearer ')[1];

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return
  }

  try {
    const decodedToken = await verifyIdToken(token);
    req.body.user_id = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token', error });
  }
};