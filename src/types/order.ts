import type { CategoryType } from "./category";

export type OrderStatus = "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELED" | number;

export type OrderUser = {
  id: number;
  name?: string | null;
  phone?: string;
};

export type Order = {
  id: number;
  status: OrderStatus;
  price: number;
  description: string;
  latitude?: number;
  longitude?: number;
  executorId?: number | null;
  userId?: number;
  user?: OrderUser;
  category: Pick<CategoryType, "id" | "name">;
};

export const isNewOrder = (status: OrderStatus) => status === "NEW" || status === 1;
export const isConfirmedOrder = (status: OrderStatus) => status === "CONFIRMED" || status === 2;
export const isCompletedOrder = (status: OrderStatus) => status === "COMPLETED" || status === 3;
