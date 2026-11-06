import axios from "axios";

export const getApiErrorMessage = (error: unknown, fallbackKey: string): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "errorNetwork";
    }

    const data = error.response.data as { message?: string | string[] } | undefined;
    const message = data?.message;

    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }

    if (Array.isArray(message) && message.length > 0) {
      return message.join(", ");
    }

    if (error.response.status === 401) {
      return "errorUnauthorized";
    }
  }

  return fallbackKey;
};
