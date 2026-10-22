import { TApiResponse, TUser } from "@/types";
import { baseApi } from "./baseApi";

export type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type TLoginPayload = {
  email: string;
  password: string;
};

export type TLoginResponse = {
  accessToken: string;
  user: TUser;
};

const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<TUser, TRegisterPayload>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        data,
      }),
      transformResponse: (response: TApiResponse<TUser>) => response.data,
    }),

    login: build.mutation<TLoginResponse, TLoginPayload>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        data,
      }),
      transformResponse: (response: TApiResponse<TLoginResponse>) => response.data,
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
