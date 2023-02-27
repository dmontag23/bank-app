// This file creates custom axios types since an interceptor is used
// which defaults many of the types to "any". This method also enables
// typing of requests, which does not seem to be available out of the
// box with axios.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios from "axios";

declare module "axios" {
  export interface AxiosInstance {
    request<T = any>(config: AxiosRequestConfig): Promise<T>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any, R = any>(
      url: string,
      data?: T,
      config?: AxiosRequestConfig
    ): Promise<R>;
    put<T = any, R = any>(
      url: string,
      data?: T,
      config?: AxiosRequestConfig
    ): Promise<R>;
    patch<T = any, R = any>(
      url: string,
      data?: T,
      config?: AxiosRequestConfig
    ): Promise<R>;
  }
}
