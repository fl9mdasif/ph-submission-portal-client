import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { paginationHelper } from '../../../shared/paginationHelper';
import pick from '../../../shared/pick';
import { TPaginationOptions } from '../../interface/pagination';
import { TCreateSubmission, TSubmissionFilters, TUpdateSubmissionStatus } from './interface.submission';
import { Prisma, SubmissionStatus } from '@prisma/client';

const createSubmission = async (studentId: string, payload: TCreateSubmission) => {
  const existing = await prisma.submission.findFirst({
    where: { studentId, repoUrl: payload.repoUrl },
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, 'You have already submitted this repository');
  }

  const submission = await prisma.submission.create({
    data: { ...payload, studentId, liveLink: payload.liveLink || null },
    include: { student: { select: { name: true, email: true } } },
  });

  return submission;
};

const getAllSubmissions = async (
  filters: TSubmissionFilters,
  paginationOptions: TPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(paginationOptions);

  const where: Prisma.SubmissionWhereInput = {};
  if (filters.status) {
    where.status = filters.status as SubmissionStatus;
  }

  const [data, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { student: { select: { name: true, email: true } } },
    }),
    prisma.submission.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSubmissionStats = async () => {
  const grouped = await prisma.submission.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  const stats = { PENDING: 0, APPROVED: 0, REJECTED: 0, total: 0 };
  for (const group of grouped) {
    stats[group.status as keyof typeof stats] = group._count.status;
    stats.total += group._count.status;
  }

  return stats;
};

const updateSubmissionStatus = async (id: string, payload: TUpdateSubmissionStatus) => {
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Submission not found');
  }

  const updated = await prisma.submission.update({
    where: { id },
    data: {
      status: payload.status,
      feedback: payload.feedback ?? null,
    },
    include: { student: { select: { name: true, email: true } } },
  });

  return updated;
};

export const submissionServices = {
  createSubmission,
  getAllSubmissions,
  getSubmissionStats,
  updateSubmissionStatus,
};
