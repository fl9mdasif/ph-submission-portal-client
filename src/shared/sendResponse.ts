import { Response } from 'express';

type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: TMeta;
  data: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  const payload: Record<string, unknown> = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
  };

  if (data.meta) {
    payload.meta = data.meta;
  }

  res.status(data.statusCode).json(payload);
};

export default sendResponse;
