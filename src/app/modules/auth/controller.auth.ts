import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { authServices } from './service.auth';

const register = catchAsync(async (req, res) => {
  const result = await authServices.register(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Student registered successfully',
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await authServices.login(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const authControllers = { register, login };
