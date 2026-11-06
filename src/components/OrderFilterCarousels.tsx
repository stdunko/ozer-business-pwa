import { useTranslation } from "react-i18next";
import type { OrderFilterStatus, OrderFiltersState } from "../types/order";
import type { OrderCategoryOption } from "../utils/orderUtils";
import CategoryIcon from "./CategoryIcon";

type OrderFilterCarouselsProps = {
  filters: OrderFiltersState;
  categories: OrderCategoryOption[];
  onChange: (next: Partial<OrderFiltersState>) => void;
};

const STATUSES: Array<OrderFilterStatus | "ALL"> = ["ALL", "NEW", "CONFIRMED", "COMPLETED", "CANCELED"];

const statusLabel = (status: OrderFilterStatus | "ALL", t: (key: string) => string) => {
  if (status === "ALL") return t("filterAll");
  if (status === "NEW") return t("orderStatus1");
  if (status === "CONFIRMED") return t("orderStatus2");
  if (status === "COMPLETED") return t("orderStatus3");
  return t("orderStatus0");
};

const OrderFilterCarousels = ({ filters, categories, onChange }: OrderFilterCarouselsProps) => {
  const { t } = useTranslation();

  return (
    <div className="order-quick-filters">
      <div className="quick-filter-block">
        <div className="quick-filter-label">{t("filterByStatus")}</div>
        <div className="filter-carousel" role="list" aria-label={t("filterByStatus")}>
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={`chip ${filters.status === status ? "active" : ""}`}
              onClick={() =>
                onChange({
                  status: filters.status === status && status !== "ALL" ? "ALL" : status,
                })
              }
            >
              {statusLabel(status, t)}
            </button>
          ))}
        </div>
      </div>
      {categories.length > 0 ? (
        <div className="quick-filter-block">
          <div className="quick-filter-label">{t("filterByCategory")}</div>
          <div className="filter-carousel" role="list" aria-label={t("filterByCategory")}>
            <button
              type="button"
              className={`chip ${filters.categoryId === "ALL" ? "active" : ""}`}
              onClick={() => onChange({ categoryId: "ALL" })}
            >
              {t("filterAll")}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`chip ${filters.categoryId === category.id ? "active" : ""}`}
                onClick={() =>
                  onChange({
                    categoryId: filters.categoryId === category.id ? "ALL" : category.id,
                  })
                }
              >
                <span className="chip-icon">
                  <CategoryIcon iconUrl={category.icon} categoryName={category.name} size={14} />
                </span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OrderFilterCarousels;
