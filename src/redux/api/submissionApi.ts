import { TApiResponse, TSubmission, TSubmissionStats, TSubmissionStatus } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export type TCreateSubmissionPayload = {
  projectName: string;
  repoUrl: string;
  liveLink?: string;
  description: string;
};

export type TGetSubmissionsParams = {
  status?: TSubmissionStatus;
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
      invalidatesTags: [tagTypes.submissions, tagTypes.stats],
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
      invalidatesTags: [tagTypes.submissions, tagTypes.stats],
    }),
  }),
});

export const {
  useCreateSubmissionMutation,
  useGetSubmissionsQuery,
  useGetSubmissionStatsQuery,
  useUpdateSubmissionStatusMutation,
} = submissionApi;
