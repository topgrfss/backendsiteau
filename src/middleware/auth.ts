import { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export type UserRole = 'admin' | 'editor' | 'viewer';

function hasPermission(userRole: UserRole, minRole: UserRole): boolean {
  if (userRole === 'admin') {
    return true;
  }
  if (userRole === 'editor') {
    return minRole === 'editor' || minRole === 'viewer';
  }
  if (userRole === 'viewer') {
    return minRole === 'viewer';
  }
  return false;
}

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
}

export function requireRole(minRole: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    const authHeader = req.header('Authorization');
    if (!authHeader) {
      res.status(401).json({ error: 'Необходима авторизация' });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Неверный формат авторизации' });
      return;
    }

    const token = parts[1];
    let userRole: UserRole | null = null;

    if (token === config.adminToken) {
      userRole = 'admin';
    } else if (token === config.editorToken) {
      userRole = 'editor';
    } else if (token === config.viewerToken) {
      userRole = 'viewer';
    } else {
      res.status(401).json({ error: 'Сессия устарела или неверный токен' });
      return;
    }

    if (!hasPermission(userRole, minRole)) {
      res.status(403).json({ error: 'Недостаточно прав для этой операции' });
      return;
    }

    req.userRole = userRole;
    next();
  };
}
