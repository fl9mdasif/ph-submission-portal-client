import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { submissionServices } from './service.submission';

const createSubmission = catchAsync(async (req, res) => {
  const studentId = req.user.id;
  const result = await submissionServices.createSubmission(studentId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Project submitted successfully',
    data: result,
  });
});

const getAllSubmissions = catchAsync(async (req, res) => {
  const query = req.query as Record<string, string>;
  const filters = { status: query.status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined };
  const paginationOptions = {
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = await submissionServices.getAllSubmissions(filters, paginationOptions);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submissions retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSubmissionStats = catchAsync(async (_req, res) => {
  const result = await submissionServices.getSubmissionStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submission statistics retrieved successfully',
    data: result,
  });
});

const updateSubmissionStatus = catchAsync(async (req, res) => {
  const id = req.params['id'] as string;
  const result = await submissionServices.updateSubmissionStatus(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Submission ${req.body.status === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
    data: result,
  });
});

export const submissionControllers = {
  createSubmission,
  getAllSubmissions,
  getSubmissionStats,
  updateSubmissionStatus,
};
