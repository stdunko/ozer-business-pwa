import axios from "axios";
import { appConfig } from "../config";
import { storage } from "../utils/storage";
import { setToken } from "../store/authSlice";
import { store } from "../store/store";
import type { ExecutorState } from "../store/executorSlice";
import type { CategoryType } from "../types/category";

const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
});

export const isValidStoredToken = (token: string | null | undefined): token is string =>
  Boolean(token && token !== "undefined" && token !== "null" && token.trim());

const getAuthToken = (): string | null => {
  const tokenFromStorage = storage.get("token");
  if (isValidStoredToken(tokenFromStorage)) {
    return tokenFromStorage;
  }
  const tokenFromStore = store.getState().authorization.token;
  return isValidStoredToken(tokenFromStore) ? tokenFromStore : null;
};

export const clearAuthSession = () => {
  storage.remove("token");
  store.dispatch(setToken(""));
};

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
    }
    return Promise.reject(error);
  }
);

type ExecutorUpdateInput = Omit<ExecutorState, "status" | "createdAt" | "updatedAt" | "phone" | "id">;

const normalizeCategoryIds = (categories?: CategoryType[] | number[]) => {
  if (!categories?.length) {
    return [];
  }
  return categories
    .map((category) => (typeof category === "number" ? category : category?.id))
    .filter((id): id is number => typeof id === "number" && id > 0);
};

const buildExecutorUpdatePayload = (executor: ExecutorUpdateInput) => ({
  name: executor.name?.trim() ?? "",
  email: executor.email?.trim() ?? "",
  latitude: Number(executor.latitude ?? 0),
  longitude: Number(executor.longitude ?? 0),
  radius: Math.round(Number(executor.radius ?? 0)),
  categories: normalizeCategoryIds(executor.categories),
  unp: executor.unp ?? null,
  adress: executor.adress?.trim() ?? "",
  isWorkInShhabat: Boolean(executor.isWorkInShhabat),
});

export const authRegister = async (phone: string) => {
  let error;
  let response;
  try {
    response = await api.post("/auth/register/executor", { phone });
  } catch (e) {
    error = e;
    console.error("Invalid phone number:", e);
  }
  return { error, response };
};

export const authLogin = async (phone: string) => {
  let error;
  let response;
  try {
    response = await api.post("/auth/login/executor", { phone });
  } catch (e) {
    error = e;
    console.error("Invalid phone number:", e);
  }
  return { error, response };
};

export const checkOtp = async (otp: string, phone: string) => {
  let error;
  let response;
  try {
    response = await api.post("/auth/verify-otp/executor", { otp, phone });
  } catch (e) {
    console.error("Error checking OTP:", e);
    error = e;
  }
  return { error, response };
};

export const getCurrentExecutor = async () => {
  let error;
  let response;
  try {
    response = await api.get("/auth/me/executor");
  } catch (e) {
    console.error("Error getting current user:", e);
    error = e;
  }
  return { error, response };
};

export const updateExecutorInfo = async (id: number, executor: ExecutorUpdateInput) => {
  let error;
  let response;
  try {
    const payload = buildExecutorUpdatePayload(executor);
    response = await api.patch(`executor/${id}`, payload);
  } catch (e) {
    const axiosError = e as { response?: { data?: unknown } };
    console.error("Error update current user:", axiosError.response?.data ?? e);
    error = e;
  }
  return { error, response };
};

export const getOrders = async () => {
  let error;
  let response;
  try {
    response = await api.get(`/order/executorOrders`);
  } catch (e) {
    console.error("Error getting orders:", e);
    error = e;
  }
  return { error, response };
};

export const getCategories = async () => {
  let error;
  let response;
  try {
    response = await api.get("/category");
  } catch (e) {
    console.error("Error getting categories:", e);
    error = e;
  }
  return { error, response };
};

export const confirmOrderByExecutor = async (orderId: number, executorId: number) => {
  let error;
  let response;
  try {
    response = await api.patch(`/order/${orderId}`, { status: "CONFIRMED", executorId });
  } catch (e) {
    console.error("Error confirm order:", e);
    error = e;
  }
  return { error, response };
};

export const cancelOrderByExecutor = async (orderId: number) => {
  let error;
  let response;
  try {
    response = await api.patch(`/order/${orderId}`, { status: "CANCELED" });
  } catch (e) {
    console.error("Error cancel order:", e);
    error = e;
  }
  return { error, response };
};

export const completeOrderByExecutor = async (orderId: number) => {
  let error;
  let response;
  try {
    response = await api.patch(`/order/${orderId}`, { status: "COMPLETED" });
  } catch (e) {
    console.error("Error complete order:", e);
    error = e;
  }
  return { error, response };
};
