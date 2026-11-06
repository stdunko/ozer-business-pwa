import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardList, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  cancelOrderByExecutor,
  completeOrderByExecutor,
  confirmOrderByExecutor,
} from "../services/api";
import { useNotifier } from "../components/AppNotifier";
import AppHeader from "../components/AppHeader";
import CategoryIcon from "../components/CategoryIcon";
import MapView from "../components/MapView";
import NameModal from "../components/NameModal";
import PersonAvatar from "../components/PersonAvatar";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { requestLiveRefresh, setOrders } from "../store/liveSlice";
import type { Chat } from "../types/chat";
import { isConfirmedOrder, isNewOrder } from "../types/order";
import { useCategoryLabel } from "../utils/categoryI18n";
import { formatOrderDate } from "../utils/orderUtils";
import { openOrCreateOrderChat } from "../utils/orderChat";

const hasCoords = (lat?: number, lng?: number) =>
  lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);

const OrderDetailScreen = () => {
  const { t, i18n } = useTranslation();
  const cat = useCategoryLabel();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const { showApiError } = useNotifier();
  const executor = useAppSelector((state) => state.executor);
  const orders = useAppSelector((state) => state.live.orders);
  const id = Number(orderId);
  const order = orders.find((item) => item.id === id);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<"confirm" | "cancel" | "complete" | null>(null);

  const onPressConfirmOrder = async () => {
    if (!order) {
      return;
    }
    setActionLoading("confirm");
    const { error } = await confirmOrderByExecutor(order.id, executor.id);
    setActionLoading(null);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    dispatch(setOrders(orders.map((item) => (item.id === order.id ? { ...item, status: 2 } : item))));
    dispatch(requestLiveRefresh());
  };

  const onPressCancelOrder = async () => {
    if (!order) {
      return;
    }
    setActionLoading("cancel");
    const { error } = await cancelOrderByExecutor(order.id);
    setActionLoading(null);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    dispatch(setOrders(orders.filter((item) => item.id !== order.id)));
    navigate("/app/orders", { replace: true });
  };

  const onPressCompleteOrder = async () => {
    if (!order) {
      return;
    }
    setActionLoading("complete");
    const { error } = await completeOrderByExecutor(order.id);
    setActionLoading(null);
    if (error) {
      showApiError(error, "errorGeneric");
      return;
    }
    dispatch(setOrders(orders.map((item) => (item.id === order.id ? { ...item, status: 3 } : item))));
    dispatch(requestLiveRefresh());
  };

  const handlePressChat = async () => {
    if (!order?.user?.id || chatLoading) {
      return;
    }
    setChatLoading(true);
    const chatData = await openOrCreateOrderChat({
      myId: executor.id,
      otherId: order.user.id,
      orderId: order.id,
      orderCategory: order.category?.name,
      participants: [
        { executor_id: executor.id, name: executor.name, photo: executor.photo },
        { user_id: order.user.id, name: order.user.name || "No user name" },
      ],
    });
    setChatLoading(false);
    const next = chatData as Chat;
    navigate(`/app/chats/${next.id}`, { state: { chat: next } });
  };

  const nameFun = () => {
    if (!executor.name || !executor.email) {
      setNameModalVisible(true);
      return;
    }
    void onPressConfirmOrder();
  };

  const statusClass = order
    ? isNewOrder(order.status)
      ? "badge-new"
      : isConfirmedOrder(order.status)
        ? "badge-work"
        : order.status === "CANCELED" || order.status === 0
          ? "badge-cancel"
          : "badge-done"
    : "";

  const statusLabel = order
    ? isNewOrder(order.status)
      ? t("orderStatus1")
      : isConfirmedOrder(order.status)
        ? t("orderStatus2")
        : order.status === "COMPLETED" || order.status === 3
          ? t("orderStatus3")
          : t("orderStatus0")
    : "";

  const createdAtLabel = order ? formatOrderDate(order, i18n.language) : null;
  const showMap = order ? hasCoords(order.latitude, order.longitude) : false;

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
        <div className="scroll">
          {showMap ? (
            <div className="map-wrap">
              <MapView
                latitude={order.latitude as number}
                longitude={order.longitude as number}
                markers={[{ latitude: order.latitude as number, longitude: order.longitude as number }]}
                interactive
              />
            </div>
          ) : null}
          <div className="pad">
            <div className="order-card order-detail-card">
              <div className="order-top">
                <div className="order-detail-head">
                  <span className="picker-row-icon">
                    <CategoryIcon categoryName={order.category?.name} size={22} />
                  </span>
                  <span>
                    <div className="order-no">{t("orderNumber", { n: order.id })}</div>
                    <div className="order-cat">{cat(order.category)}</div>
                  </span>
                </div>
                <span className={`badge ${statusClass}`}>{statusLabel}</span>
              </div>
              {createdAtLabel ? (
                <div className="muted">
                  {t("orderCreatedAt")}: {createdAtLabel}
                </div>
              ) : null}
              <p className="order-desc">{order.description}</p>
              {order.user ? (
                <div className="executor-box">
                  <PersonAvatar className="executor-avatar" name={order.user.name} userId={order.user.id} />
                  <div>
                    <div className="muted">{t("customer")}</div>
                    <div className="executor-name">{order.user.name}</div>
                    {order.user.phone ? <div className="muted">{order.user.phone}</div> : null}
                  </div>
                </div>
              ) : null}
              <div className="order-footer">
                <div className="price">{order.price} ₪</div>
              </div>
            </div>
            <div className="order-detail-actions">
              {order.user?.id ? (
                <button type="button" className="btn btn-secondary" onClick={() => void handlePressChat()} disabled={chatLoading}>
                  {chatLoading ? <span className="spinner" /> : <><MessageCircle size={20} /> {t("goToChat")}</>}
                </button>
              ) : null}
              {isNewOrder(order.status) ? (
                <button type="button" className="btn btn-primary" onClick={nameFun} disabled={actionLoading === "confirm"}>
                  {actionLoading === "confirm" ? <span className="spinner" /> : t("getStarted")}
                </button>
              ) : null}
              {isConfirmedOrder(order.status) ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void onPressCompleteOrder()}
                    disabled={actionLoading === "complete"}
                  >
                    {actionLoading === "complete" ? <span className="spinner" /> : t("orderCompleted")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-outline"
                    onClick={() => setConfirmCancel(true)}
                    disabled={actionLoading === "cancel"}
                  >
                    {actionLoading === "cancel" ? <span className="spinner" /> : t("cancelOrder")}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
      <NameModal isVisible={nameModalVisible} onClose={() => setNameModalVisible(false)} />
      {confirmCancel ? (
        <div className="modal-backdrop center" onClick={() => setConfirmCancel(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="sheet-title">{t("cancelOrderTitle")}</h3>
            <p className="hint" style={{ marginTop: 12 }}>{t("cancelOrderConfirm")}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmCancel(false)}>
                {t("cancel")}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setConfirmCancel(false);
                  void onPressCancelOrder();
                }}
              >
                {t("cancelOrder")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OrderDetailScreen;
