import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { authRateLimiter } from '../../middlewares/rateLimiters';
import { authControllers } from './controller.auth';
import { authValidations } from './validation.auth';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateRequest(authValidations.registerSchema),
  authControllers.register,
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest(authValidations.loginSchema),
  authControllers.login,
);

export const authRoutes = router;
