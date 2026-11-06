import { useEffect, useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import PrimaryButton from "./PrimaryButton";
import {
  defaultOrderFilters,
  type Order,
  type OrderFilterStatus,
  type OrderFiltersState,
  type PriceSort,
} from "../types/order";
import { getUniqueOrderCategories, hasActiveOrderFilters } from "../utils/orderUtils";

type OrderFiltersModalProps = {
  isVisible: boolean;
  orders: Order[];
  filters: OrderFiltersState;
  onClose: () => void;
  onApply: (filters: OrderFiltersState) => void;
};

const STATUS_OPTIONS: Array<OrderFilterStatus | "ALL"> = [
  "ALL",
  "NEW",
  "CONFIRMED",
  "COMPLETED",
  "CANCELED",
];

const PRICE_SORT_OPTIONS: PriceSort[] = ["default", "asc", "desc"];

const FilterChip = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <button type="button" className={`chip ${isActive ? "active" : ""}`} onClick={onPress}>
    {label}
  </button>
);

const FilterSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <div>
    <div className="section-title">{title}</div>
    <div className="section-body">{children}</div>
  </div>
);

const OrderFiltersModal = ({
  isVisible,
  orders,
  filters,
  onClose,
  onApply,
}: OrderFiltersModalProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<OrderFiltersState>(filters);
  const categories = useMemo(() => getUniqueOrderCategories(orders), [orders]);

  useEffect(() => {
    if (isVisible) {
      setDraft(filters);
    }
  }, [isVisible, filters]);

  if (!isVisible) {
    return null;
  }

  const statusLabel = (status: OrderFilterStatus | "ALL") => {
    if (status === "ALL") return t("filterAll");
    if (status === "NEW") return t("orderStatus1");
    if (status === "CONFIRMED") return t("orderStatus2");
    if (status === "COMPLETED") return t("orderStatus3");
    return t("orderStatus0");
  };

  const priceSortLabel = (sort: PriceSort) => {
    if (sort === "asc") return t("priceSortAsc");
    if (sort === "desc") return t("priceSortDesc");
    return t("priceSortDefault");
  };

  const setDraftFilter = <K extends keyof OrderFiltersState>(key: K, value: OrderFiltersState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">{t("filtersTitle")}</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        <div className="sheet-body">
          <FilterSection title={t("filterByStatus")}>
            <div className="chips">
              {STATUS_OPTIONS.map((status) => (
                <FilterChip
                  key={status}
                  label={statusLabel(status)}
                  isActive={draft.status === status}
                  onPress={() => setDraftFilter("status", status)}
                />
              ))}
            </div>
          </FilterSection>
          {categories.length > 0 ? (
            <FilterSection title={t("filterByCategory")}>
              <div className="chips">
                <FilterChip
                  label={t("filterAll")}
                  isActive={draft.categoryId === "ALL"}
                  onPress={() => setDraftFilter("categoryId", "ALL")}
                />
                {categories.map((category) => (
                  <FilterChip
                    key={category.id}
                    label={category.name}
                    isActive={draft.categoryId === category.id}
                    onPress={() => setDraftFilter("categoryId", category.id)}
                  />
                ))}
              </div>
            </FilterSection>
          ) : null}
          <FilterSection title={t("filterByPrice")}>
            <div className="chips">
              {PRICE_SORT_OPTIONS.map((sort) => (
                <FilterChip
                  key={sort}
                  label={priceSortLabel(sort)}
                  isActive={draft.priceSort === sort}
                  onPress={() => setDraftFilter("priceSort", sort)}
                />
              ))}
            </div>
            <div className="price-row">
              <div className="price-field">
                <div className="price-label">{t("priceFrom")}</div>
                <input
                  className="input"
                  value={draft.priceMin}
                  onChange={(e) => setDraftFilter("priceMin", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="0"
                  inputMode="numeric"
                />
              </div>
              <div className="price-field">
                <div className="price-label">{t("priceTo")}</div>
                <input
                  className="input"
                  value={draft.priceMax}
                  onChange={(e) => setDraftFilter("priceMax", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="∞"
                  inputMode="numeric"
                />
              </div>
            </div>
          </FilterSection>
        </div>
        <div className="sheet-footer">
          {hasActiveOrderFilters(draft) ? (
            <button type="button" className="reset-btn" onClick={() => setDraft(defaultOrderFilters)}>
              {t("resetFilters")}
            </button>
          ) : (
            <div style={{ width: 88 }} />
          )}
          <PrimaryButton
            title={t("applyFilters")}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderFiltersModal;
