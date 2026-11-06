import { useState } from "react";
import { ChevronRight, MapPin, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../store/hooks";
import type { Order } from "../types/order";
import { isConfirmedOrder, isNewOrder } from "../types/order";
import { useCategoryLabel } from "../utils/categoryI18n";
import { openOrCreateOrderChat } from "../utils/orderChat";
import ExecutorGeo from "./ExecutorGeo";
import NameModal from "./NameModal";

type OrderItemProps = {
  item: Order;
  isGeoVisible: boolean;
  setVisibleGeoId: (id: number | null) => void;
  onConfirmOrder: (id: number) => void;
  onCancelOrder: (id: number) => void;
  onCompleteOrder: (id: number) => void;
  onMessagePress?: (chat: unknown) => void;
  onOpen?: () => void;
};

const OrderItem = ({
  item,
  isGeoVisible,
  setVisibleGeoId,
  onConfirmOrder,
  onCancelOrder,
  onCompleteOrder,
  onMessagePress,
  onOpen,
}: OrderItemProps) => {
  const { t } = useTranslation();
  const cat = useCategoryLabel();
  const executor = useAppSelector((state) => state.executor);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const statusClass = isNewOrder(item.status)
    ? "badge-new"
    : isConfirmedOrder(item.status)
      ? "badge-work"
      : item.status === "CANCELED" || item.status === 0
        ? "badge-cancel"
        : "badge-done";

  const statusLabel = isNewOrder(item.status)
    ? t("orderStatus1")
    : isConfirmedOrder(item.status)
      ? t("orderStatus2")
      : item.status === "COMPLETED" || item.status === 3
        ? t("orderStatus3")
        : t("orderStatus0");

  const handlePressChat = async () => {
    if (!item.user?.id) {
      return;
    }
    const chatData = await openOrCreateOrderChat({
      myId: executor.id,
      otherId: item.user.id,
      orderId: item.id,
      orderCategory: item.category?.name,
      participants: [
        { executor_id: executor.id, name: executor.name, photo: executor.photo },
        { user_id: item.user.id, name: item.user.name || "No user name" },
      ],
    });
    onMessagePress?.(chatData);
  };

  const nameFun = () => {
    if (!executor.name || !executor.email) {
      setNameModalVisible(true);
      return;
    }
    onConfirmOrder(item.id);
  };

  return (
    <div className="order-card">
      <div className="order-top">
        {onOpen ? (
          <button type="button" className="order-no" onClick={onOpen}>
            {t("orderNumber", { n: item.id })}
          </button>
        ) : (
          <div className="order-no">{t("orderNumber", { n: item.id })}</div>
        )}
        <span className={`badge ${statusClass}`}>{statusLabel}</span>
        {onOpen ? (
          <button type="button" className="order-cat" onClick={onOpen}>
            {cat(item.category)}
          </button>
        ) : (
          <div className="order-cat">{cat(item.category)}</div>
        )}
        {onOpen ? (
          <button type="button" className="order-open-link" onClick={onOpen}>
            {t("openOrder")}
            <ChevronRight size={16} className="order-open-chevron" />
          </button>
        ) : null}
      </div>
      <p className="order-desc">{item.description}</p>
      <button type="button" className="geo-btn" onClick={() => setVisibleGeoId(isGeoVisible ? null : item.id)}>
        <MapPin size={18} />
        {t("openGeo")}
      </button>
      {item.user ? (
        <div className="executor-box">
          <div className="muted">{t("customer")}</div>
          <div className="executor-name">{item.user.name}</div>
          <div className="muted">{item.user.phone}</div>
        </div>
      ) : null}
      <div className="order-footer">
        <div className="price">{item.price} ₪</div>
        <button type="button" className="chat-icon-btn" onClick={handlePressChat}>
          <MessageCircle size={22} />
        </button>
      </div>
      {isNewOrder(item.status) ? (
        <div className="order-actions">
          <button type="button" className="action-btn" onClick={nameFun}>
            {t("getStarted")}
          </button>
        </div>
      ) : null}
      {isConfirmedOrder(item.status) ? (
        <div className="order-actions">
          <button type="button" className="action-btn" onClick={() => onCompleteOrder(item.id)}>
            {t("orderCompleted")}
          </button>
          <button type="button" className="action-btn-outline" onClick={() => setConfirmCancel(true)}>
            {t("cancelOrder")}
          </button>
        </div>
      ) : null}
      <ExecutorGeo
        latitude={item.latitude || 0}
        longitude={item.longitude || 0}
        isVisible={isGeoVisible}
        onClose={() => setVisibleGeoId(null)}
      />
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
                  onCancelOrder(item.id);
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

export default OrderItem;
