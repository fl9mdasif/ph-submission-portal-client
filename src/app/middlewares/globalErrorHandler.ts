import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import ApiError from '../errors/ApiError';
import config from '../../config';

const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errorDetails: unknown = err;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = null;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation error';
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this data already exists';
      errorDetails = null;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
      errorDetails = null;
    } else {
      statusCode = 400;
      message = 'Database operation failed';
    }
  } else if (err instanceof PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    errorDetails = null;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const isErr = err instanceof Error;
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorDetails: config.NODE_ENV === 'production' ? null : errorDetails,
    stack: config.NODE_ENV === 'production' ? null : (isErr ? err.stack : null),
  });
};

export default globalErrorHandler;
