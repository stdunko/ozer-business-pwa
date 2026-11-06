import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  cancelOrderByExecutor,
  completeOrderByExecutor,
  confirmOrderByExecutor,
  getOrders,
} from "../services/api";
import { useAppSelector } from "../store/hooks";
import { useNotifier } from "../components/AppNotifier";
import AppHeader from "../components/AppHeader";
import OrderItem from "../components/OrderItem";
import type { Order } from "../types/order";
import type { Chat } from "../types/chat";

const OrderScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showApiError } = useNotifier();
  const executor = useAppSelector((state) => state.executor);
  const [orders, setOrders] = useState<Order[]>([]);
  const [visibleGeoId, setVisibleGeoId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    setRefreshing(true);
    const { response, error } = await getOrders();
    if (error) {
      showApiError(error, "errorLoadOrders");
    } else {
      setOrders(response?.data ?? []);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const onPressConfirmOrder = async (id: number) => {
    const { error } = await confirmOrderByExecutor(id, executor.id);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: 2 } : order)));
  };

  const onPressCancelOrder = async (id: number) => {
    const { error } = await cancelOrderByExecutor(id);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  const onPressCompleteOrder = async (id: number) => {
    const { error } = await completeOrderByExecutor(id);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: 3 } : order)));
  };

  return (
    <div className="screen">
      <AppHeader title={t("orders")} />
      {refreshing && orders.length === 0 ? (
        <div className="loader">
          <span className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <p className="empty">{t("yourOrdersEmpty")}</p>
      ) : (
        <div className="scroll pad">
          {orders.map((item) => (
            <OrderItem
              key={item.id}
              item={item}
              isGeoVisible={visibleGeoId === item.id}
              setVisibleGeoId={setVisibleGeoId}
              onConfirmOrder={onPressConfirmOrder}
              onCancelOrder={onPressCancelOrder}
              onCompleteOrder={onPressCompleteOrder}
              onMessagePress={(chat) => {
                const next = chat as Chat;
                navigate(`/app/chats/${next.id}`, { state: { chat: next } });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderScreen;
