import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Funnel } from "lucide-react";
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
import OrderFiltersModal from "../components/OrderFiltersModal";
import PullToRefresh from "../components/PullToRefresh";
import { defaultOrderFilters, type OrderFiltersState } from "../types/order";
import { filterOrders, hasActiveOrderFilters } from "../utils/orderUtils";
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
  const [filters, setFilters] = useState<OrderFiltersState>(defaultOrderFilters);
  const [isFiltersVisible, setFiltersVisible] = useState(false);

  const filteredOrders = useMemo(() => filterOrders(orders, filters), [orders, filters]);
  const filtersActive = hasActiveOrderFilters(filters);

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

  const listEmptyText =
    orders.length > 0 && filtersActive ? t("ordersNotFound") : t("yourOrdersEmpty");

  return (
    <div className="screen">
      <AppHeader
        title={t("orders")}
        right={
          <button type="button" className="icon-btn relative" onClick={() => setFiltersVisible(true)}>
            <Funnel size={22} fill={filtersActive ? "currentColor" : "none"} />
            {filtersActive ? <span className="filter-badge" /> : null}
          </button>
        }
      />
      {initialLoading && orders.length === 0 ? (
        <div className="loader">
          <span className="spinner" />
        </div>
      ) : (
        <PullToRefresh onRefresh={onRefresh} className="pad">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <ClipboardList size={32} />
              </div>
              <p className="empty">{listEmptyText}</p>
            </div>
          ) : (
            filteredOrders.map((item) => (
              <OrderItem
                key={item.id}
                item={item}
                isGeoVisible={visibleGeoId === item.id}
                setVisibleGeoId={setVisibleGeoId}
                onOpen={() => navigate(`/app/orders/${item.id}`)}
                onConfirmOrder={onPressConfirmOrder}
                onCancelOrder={onPressCancelOrder}
                onCompleteOrder={onPressCompleteOrder}
                onMessagePress={(chat) => {
                  const next = chat as Chat;
                  navigate(`/app/chats/${next.id}`, { state: { chat: next } });
                }}
              />
            ))
          )}
        </PullToRefresh>
      )}
      <OrderFiltersModal
        isVisible={isFiltersVisible}
        orders={orders}
        filters={filters}
        onClose={() => setFiltersVisible(false)}
        onApply={setFilters}
      />
    </div>
  );
};

export default OrderScreen;
