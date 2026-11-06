import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  cancelOrderByExecutor,
  completeOrderByExecutor,
  confirmOrderByExecutor,
} from "../services/api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { requestLiveRefresh, setOrders } from "../store/liveSlice";
import { useNotifier } from "../components/AppNotifier";
import AppHeader from "../components/AppHeader";
import OrderItem from "../components/OrderItem";
import PullToRefresh from "../components/PullToRefresh";
import type { Chat } from "../types/chat";

const OrderScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showApiError } = useNotifier();
  const executor = useAppSelector((state) => state.executor);
  const orders = useAppSelector((state) => state.live.orders);
  const initialLoading = useAppSelector((state) => state.live.ordersLoading);
  const [visibleGeoId, setVisibleGeoId] = useState<number | null>(null);

  const onPressConfirmOrder = async (id: number) => {
    const { error } = await confirmOrderByExecutor(id, executor.id);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    dispatch(setOrders(orders.map((order) => (order.id === id ? { ...order, status: 2 } : order))));
    dispatch(requestLiveRefresh());
  };

  const onPressCancelOrder = async (id: number) => {
    const { error } = await cancelOrderByExecutor(id);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    dispatch(setOrders(orders.filter((order) => order.id !== id)));
  };

  const onPressCompleteOrder = async (id: number) => {
    const { error } = await completeOrderByExecutor(id);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    dispatch(setOrders(orders.map((order) => (order.id === id ? { ...order, status: 3 } : order))));
    dispatch(requestLiveRefresh());
  };

  const onRefresh = async () => {
    dispatch(requestLiveRefresh());
    await new Promise((resolve) => setTimeout(resolve, 600));
  };

  return (
    <div className="screen">
      <AppHeader title={t("orders")} />
      {initialLoading && orders.length === 0 ? (
        <div className="loader">
          <span className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ClipboardList size={32} />
          </div>
          <p className="empty">{t("yourOrdersEmpty")}</p>
        </div>
      ) : (
        <PullToRefresh onRefresh={onRefresh} className="pad">
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
        </PullToRefresh>
      )}
    </div>
  );
};

export default OrderScreen;
