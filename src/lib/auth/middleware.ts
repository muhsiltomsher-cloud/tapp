import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { UserRole } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

export function authenticateRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  return payload;
}

export function requireAuth(handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return handler(request, user);
  };
}

export function requireRole(roles: UserRole[]) {
  return (handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const user = authenticateRequest(request);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      if (!roles.includes(user.role as UserRole)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request, user);
    };
  };
}
