import type { Order, OrderFilterStatus, OrderFiltersState } from "../types/order";

export const normalizeOrderStatus = (status: Order["status"]): OrderFilterStatus => {
  if (status === 0 || status === "CANCELED") return "CANCELED";
  if (status === 2 || status === "CONFIRMED") return "CONFIRMED";
  if (status === 3 || status === "COMPLETED") return "COMPLETED";
  return "NEW";
};

export const getOrderCreatedAt = (order: Order): Date | null => {
  const raw = order.createdAt ?? order.created_at;
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getUniqueOrderCategories = (orders: Order[]) => {
  const map = new Map<number, string>();
  orders.forEach((order) => {
    if (order.category?.id != null && order.category?.name) {
      map.set(order.category.id, order.category.name);
    }
  });
  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const filterOrders = (orders: Order[], filters: OrderFiltersState): Order[] => {
  const priceMin = filters.priceMin.trim() ? Number(filters.priceMin) : null;
  const priceMax = filters.priceMax.trim() ? Number(filters.priceMax) : null;

  let result = orders.filter((order) => {
    if (filters.status !== "ALL" && normalizeOrderStatus(order.status) !== filters.status) {
      return false;
    }
    if (filters.categoryId !== "ALL" && order.category?.id !== filters.categoryId) {
      return false;
    }
    const price = Number(order.price);
    if (priceMin != null && !Number.isNaN(priceMin) && price < priceMin) {
      return false;
    }
    if (priceMax != null && !Number.isNaN(priceMax) && price > priceMax) {
      return false;
    }
    return true;
  });

  if (filters.priceSort === "asc") {
    result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
  } else if (filters.priceSort === "desc") {
    result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
  } else {
    result = [...result].sort((a, b) => {
      const timeA = getOrderCreatedAt(a)?.getTime() ?? 0;
      const timeB = getOrderCreatedAt(b)?.getTime() ?? 0;
      return timeB - timeA;
    });
  }

  return result;
};

export const hasActiveOrderFilters = (filters: OrderFiltersState) =>
  filters.status !== "ALL" ||
  filters.categoryId !== "ALL" ||
  filters.priceMin.trim() !== "" ||
  filters.priceMax.trim() !== "" ||
  filters.priceSort !== "default";
