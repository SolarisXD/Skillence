const DEFAULT_API_URL = "http://localhost:8000";

const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== "string") {
    return DEFAULT_API_URL;
  }

  return value.replace(/\/+$/, "");
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

export const apiUrl = (path) => {
  if (!path) {
    return API_BASE_URL;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
