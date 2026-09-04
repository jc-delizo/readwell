const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'access';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const tokenStorage = {
  get: () => window.localStorage.getItem(TOKEN_KEY),
  set: (token) => window.localStorage.setItem(TOKEN_KEY, token),
  clear: () => window.localStorage.removeItem(TOKEN_KEY),
};

export const api = async (path, options = {}) => {
  const { body, headers = {}, token = tokenStorage.get(), ...requestOptions } = options;
  const requestHeaders = { Accept: 'application/json', ...headers };
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    body:
      body === undefined || body instanceof FormData ? body : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data?.message
        ? data.message
        : `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status, data);
  }

  return data;
};
