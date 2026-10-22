import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import catchAsync from '../../shared/catchAsync';

const validateRequest = (schema: ZodSchema) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    await schema.parseAsync({ body: req.body });
    next();
  });
};

export default validateRequest;
