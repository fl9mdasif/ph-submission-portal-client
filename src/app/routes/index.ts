import { Router } from 'express';
import { authRoutes } from '../modules/auth/routes.auth';
import { submissionRoutes } from '../modules/submission/routes.submission';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: authRoutes },
  { path: '/submissions', route: submissionRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
