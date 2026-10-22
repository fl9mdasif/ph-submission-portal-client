import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { jwtHelpers } from '../../../helpers/jwtHelpers';

const register = async (payload: { name: string; email: string; password: string }) => {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, 'An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.bcrypt_salt_round);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: 'STUDENT', // always STUDENT — never read role from request body
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return user;
};

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const accessToken = jwtHelpers.generateToken(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in,
  );

  return {
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const authServices = { register, login };
