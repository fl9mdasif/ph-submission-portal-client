import { TActivityLog, TApiResponse, TSubmission, TSubmissionStats, TSubmissionStatus } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export type TCreateSubmissionPayload = {
  assignmentNumber: number;
  projectName: string;
  repoUrl: string;
  liveLink?: string;
  description: string;
};

export type TEditSubmissionPayload = TCreateSubmissionPayload & { id: string };

export type TGetSubmissionsParams = {
  status?: TSubmissionStatus;
  assignmentNumber?: number;
  searchTerm?: string;
  page?: number;
  limit?: number;
};

export type TUpdateStatusPayload = {
  id: string;
  status: "APPROVED" | "REJECTED";
  feedback?: string;
};

const submissionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createSubmission: build.mutation<TSubmission, TCreateSubmissionPayload>({
      query: (data) => ({
        url: "/submissions",
        method: "POST",
        data,
      }),
      transformResponse: (response: TApiResponse<TSubmission>) => response.data,
      invalidatesTags: [tagTypes.submissions, tagTypes.mySubmissions, tagTypes.stats],
    }),

    editSubmission: build.mutation<TSubmission, TEditSubmissionPayload>({
      query: ({ id, ...data }) => ({
        url: `/submissions/${id}`,
        method: "PATCH",
        data,
      }),
      transformResponse: (response: TApiResponse<TSubmission>) => response.data,
      invalidatesTags: [tagTypes.submissions, tagTypes.mySubmissions, tagTypes.stats],
    }),

    getMySubmissions: build.query<TSubmission[], void>({
      query: () => ({
        url: "/submissions/my",
        method: "GET",
      }),
      transformResponse: (response: TApiResponse<TSubmission[]>) => response.data,
      providesTags: [tagTypes.mySubmissions],
    }),

    getSubmissions: build.query<
      { data: TSubmission[]; meta: TApiResponse<TSubmission[]>["meta"] },
      TGetSubmissionsParams
    >({
      query: (params) => ({
        url: "/submissions",
        method: "GET",
        params,
      }),
      transformResponse: (response: TApiResponse<TSubmission[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.submissions],
    }),

    getSubmissionStats: build.query<TSubmissionStats, void>({
      query: () => ({
        url: "/submissions/stats",
        method: "GET",
      }),
      transformResponse: (response: TApiResponse<TSubmissionStats>) => response.data,
      providesTags: [tagTypes.stats],
    }),

    updateSubmissionStatus: build.mutation<TSubmission, TUpdateStatusPayload>({
      query: ({ id, ...data }) => ({
        url: `/submissions/${id}/status`,
        method: "PATCH",
        data,
      }),
      transformResponse: (response: TApiResponse<TSubmission>) => response.data,
      invalidatesTags: [tagTypes.submissions, tagTypes.stats, tagTypes.activity],
    }),

    getMentorActivity: build.query<
      { data: TActivityLog[]; meta: TApiResponse<TActivityLog[]>["meta"] },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/submissions/activity",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: TApiResponse<TActivityLog[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.activity],
    }),
  }),
});

export const {
  useCreateSubmissionMutation,
  useEditSubmissionMutation,
  useGetMySubmissionsQuery,
  useGetSubmissionsQuery,
  useGetSubmissionStatsQuery,
  useUpdateSubmissionStatusMutation,
  useGetMentorActivityQuery,
} = submissionApi;
