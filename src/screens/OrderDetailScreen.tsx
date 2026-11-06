import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  cancelOrderByExecutor,
  completeOrderByExecutor,
  confirmOrderByExecutor,
} from "../services/api";
import { useNotifier } from "../components/AppNotifier";
import AppHeader from "../components/AppHeader";
import OrderItem from "../components/OrderItem";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { requestLiveRefresh, setOrders } from "../store/liveSlice";
import type { Chat } from "../types/chat";

const OrderDetailScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const { showApiError } = useNotifier();
  const executor = useAppSelector((state) => state.executor);
  const orders = useAppSelector((state) => state.live.orders);
  const id = Number(orderId);
  const order = orders.find((item) => item.id === id);
  const [visibleGeoId, setVisibleGeoId] = useState<number | null>(null);

  const onPressConfirmOrder = async (nextId: number) => {
    const { error } = await confirmOrderByExecutor(nextId, executor.id);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    dispatch(setOrders(orders.map((item) => (item.id === nextId ? { ...item, status: 2 } : item))));
    dispatch(requestLiveRefresh());
  };

  const onPressCancelOrder = async (nextId: number) => {
    const { error } = await cancelOrderByExecutor(nextId);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    dispatch(setOrders(orders.filter((item) => item.id !== nextId)));
    navigate("/app/orders", { replace: true });
  };

  const onPressCompleteOrder = async (nextId: number) => {
    const { error } = await completeOrderByExecutor(nextId);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    dispatch(setOrders(orders.map((item) => (item.id === nextId ? { ...item, status: 3 } : item))));
    dispatch(requestLiveRefresh());
  };

  return (
    <div className="screen">
      <AppHeader title={order ? t("orderNumber", { n: order.id }) : t("orders")} back />
      {!order ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ClipboardList size={32} />
          </div>
          <p className="empty">{t("orderNotFound")}</p>
        </div>
      ) : (
        <div className="scroll pad">
          <OrderItem
            item={order}
            isGeoVisible={visibleGeoId === order.id}
            setVisibleGeoId={setVisibleGeoId}
            onConfirmOrder={onPressConfirmOrder}
            onCancelOrder={onPressCancelOrder}
            onCompleteOrder={onPressCompleteOrder}
            onMessagePress={(chat) => {
              const next = chat as Chat;
              navigate(`/app/chats/${next.id}`, { state: { chat: next } });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OrderDetailScreen;
