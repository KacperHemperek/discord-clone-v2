/**
 *
 * @param path path to api endpoint starting with /
 * @param options fetch options
 * @returns result of fetch call to api endpoint
 */
export function api(path: string, options: RequestInit = {}) {
  return fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
    },
  });
}
