import type { Order } from "../types/order";
import { isNewOrder } from "../types/order";

export const ORDERS_POLL_INTERVAL_MS = 8_000;

type NewOrderHandler = (order: Order) => void;

export const reportNewIncomingOrders = (
  previousOrders: Order[],
  nextOrders: Order[],
  onNew: NewOrderHandler
) => {
  if (previousOrders.length === 0) {
    return;
  }
  const knownIds = new Set(previousOrders.map((order) => order.id));
  nextOrders.forEach((order) => {
    if (!knownIds.has(order.id) && isNewOrder(order.status)) {
      onNew(order);
    }
  });
};
