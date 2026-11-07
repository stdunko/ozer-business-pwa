import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import PrimaryButton from "./PrimaryButton";
import AppTextInput from "./AppTextInput";
import CategoryIcon from "./CategoryIcon";
import {
  defaultOrderFilters,
  type OrderFilterStatus,
  type OrderFiltersState,
  type PriceSort,
} from "../types/order";
import { useCategoryLabel } from "../utils/categoryI18n";
import { type OrderCategoryOption } from "../utils/orderUtils";

type OrderFiltersModalProps = {
  isVisible: boolean;
  categories: OrderCategoryOption[];
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
  categories,
  filters,
  onClose,
  onApply,
}: OrderFiltersModalProps) => {
  const { t } = useTranslation();
  const cat = useCategoryLabel();
  const [draft, setDraft] = useState<OrderFiltersState>(filters);
  const [categoryQuery, setCategoryQuery] = useState("");

  useEffect(() => {
    if (isVisible) {
      setDraft(filters);
      setCategoryQuery("");
    }
  }, [isVisible, filters]);

  const visibleCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();
    if (!query) {
      return categories;
    }
    return categories.filter((item) => {
      const label = cat(item).toLowerCase();
      return label.includes(query) || item.name.toLowerCase().includes(query);
    });
  }, [cat, categories, categoryQuery]);

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

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sheet filters-sheet" onClick={(e) => e.stopPropagation()}>
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
          <FilterSection title={t("filterByCategory")}>
            {categories.length > 6 ? (
              <div className="filter-category-search">
                <AppTextInput
                  icon={Search}
                  placeholder={t("searchCategories")}
                  value={categoryQuery}
                  onChange={(e) => setCategoryQuery(e.target.value)}
                />
              </div>
            ) : null}
            <div className="picker-list filter-category-list">
              <button
                type="button"
                className={`picker-row ${draft.categoryId === "ALL" ? "selected" : ""}`}
                onClick={() => setDraftFilter("categoryId", "ALL")}
              >
                <span className="picker-row-name">{t("filterAll")}</span>
              </button>
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`picker-row ${draft.categoryId === category.id ? "selected" : ""}`}
                  onClick={() => setDraftFilter("categoryId", category.id)}
                >
                  <span className="picker-row-icon">
                    <CategoryIcon iconUrl={category.icon} categoryName={category.name} size={22} />
                  </span>
                  <span className="picker-row-name">{cat(category)}</span>
                </button>
              ))}
            </div>
            {categories.length > 0 && visibleCategories.length === 0 ? (
              <p className="empty">{t("categoriesNotFound")}</p>
            ) : null}
          </FilterSection>
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
        <div className="sheet-footer sheet-footer-stack">
          <PrimaryButton
            className="sheet-apply"
            title={t("applyFilters")}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          />
          <button
            type="button"
            className="reset-btn"
            onClick={() => {
              setDraft(defaultOrderFilters);
              onApply(defaultOrderFilters);
            }}
          >
            {t("resetFilters")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrderFiltersModal;
