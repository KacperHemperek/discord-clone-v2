import { ApiErrorResponse } from '@shared/types/errors';
import { ClientError } from './clientError';

type RequestOptions = Omit<RequestInit, 'method'>;
type GetRequestOptions = Omit<RequestOptions, 'body'>;

export class api {
  /**
   *
   * @param path path to api endpoint starting with /
   * @param options fetch options without body
   *
   * @description Calls api with method GET and returns json response of type T
   */
  static async get<T>(
    path: string,
    options: GetRequestOptions = {}
  ): Promise<T> {
    return await request<T>(path, {
      ...options,
      method: 'GET',
    });
  }

  /**
   *
   * @param path path to api endpoint starting with /
   * @param options fetch options
   * @description Calls api with method POST and returns json response of type T
   */
  static async post<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return await request<T>(path, {
      ...options,
      method: 'POST',
    });
  }
  /**
   *
   * @param path path to api endpoint starting with /
   * @param options fetch options
   * @description Calls api with method PUT and returns json response of type T
   */
  static async put<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return await request<T>(path, {
      ...options,
      method: 'PUT',
    });
  }

  /**
   *
   * @param path path to api endpoint starting with /
   * @param options fetch options
   * @description Calls api with method DELETE and returns json response of type T
   */
  static async delete<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return await request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${import.meta.env.VITE_API_URL}${path}`;

  const baseHeaders: RequestInit['headers'] = {
    'Content-Type': 'application/json',
  };

  const baseOptions: RequestInit = {
    credentials: 'include',
  };

  const headers =
    options.method === 'GET'
      ? options.headers
      : { ...baseHeaders, ...options.headers };

  const res = await fetch(url, {
    ...baseOptions,
    ...options,
    headers,
  });

  if (!res.ok) {
    const error: ApiErrorResponse = await res.json();

    if (error.type !== 'unhandled') {
      throw new ClientError(error.message, error.statusCode);
    } else {
      throw new ClientError(error.message);
    }
  }

  const json: T = await res.json();

  return json;
}
