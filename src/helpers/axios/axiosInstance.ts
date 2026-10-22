import axios from "axios";
import { authKey } from "@/contains/authKey";
import { getFromLocalStorage } from "@/utils/local-storage";

const instance = axios.create({
  timeout: 15000,
});

instance.interceptors.request.use(
  function (config) {
    const token = getFromLocalStorage(authKey);
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default instance;
