import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import catchAsync from '../../shared/catchAsync';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & { id: string; email: string; role: string };
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access — no token provided');
    }

    const decoded = jwtHelpers.verifyToken(token, config.jwt_access_secret as string);

    if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission for this action');
    }

    req.user = decoded as JwtPayload & { id: string; email: string; role: string };
    next();
  });
};

export default auth;
