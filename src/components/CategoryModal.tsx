import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CategoryType } from "../types/category";
import { useCategoryLabel } from "../utils/categoryI18n";
import AppTextInput from "./AppTextInput";
import CategoryIcon from "./CategoryIcon";
import PrimaryButton from "./PrimaryButton";

type CategoryModalProps = {
  isVisible: boolean;
  categories: CategoryType[];
  selectedCategories: CategoryType[];
  onCategorySelect: (category: CategoryType) => void;
  onAddCategories: () => void;
  onClose: () => void;
};

const CategoryModal = ({
  isVisible,
  categories,
  selectedCategories,
  onCategorySelect,
  onAddCategories,
  onClose,
}: CategoryModalProps) => {
  const { t } = useTranslation();
  const cat = useCategoryLabel();
  const [search, setSearch] = useState("");
  const selectedCount = selectedCategories.length;

  useEffect(() => {
    if (!isVisible) {
      setSearch("");
    }
  }, [isVisible]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return categories;
    }
    return categories.filter((item) => {
      const label = cat(item).toLowerCase();
      return label.includes(query) || item.name.toLowerCase().includes(query);
    });
  }, [cat, categories, search]);

  if (!isVisible) {
    return null;
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">{t("selectCategories")}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t("close")}>
            <X size={22} />
          </button>
        </div>
        <div className="sheet-search">
          <AppTextInput
            icon={Search}
            placeholder={t("searchCategories")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {selectedCount > 0 ? (
          <p className="hint sheet-hint">{t("add")}: {selectedCount}</p>
        ) : null}
        <div className="sheet-body">
          {filtered.length === 0 ? (
            <p className="empty">{search.trim() ? t("categoriesNotFound") : t("yourCategories")}</p>
          ) : (
            <div className="grid sheet-grid">
              {filtered.map((item) => {
                const isSelected = selectedCategories.some((cat) => cat.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`category-card ${isSelected ? "selected" : ""}`}
                    onClick={() => onCategorySelect(item)}
                  >
                    <div className="category-icon">
                      <CategoryIcon iconUrl={item.icon || item.iconName} categoryName={item.name} />
                    </div>
                    <div className="category-name">{cat(item)}</div>
                    {isSelected ? (
                      <span className="check-badge">
                        <Check size={14} color="#fff" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="sheet-footer sheet-footer-stack">
          <PrimaryButton title={t("add")} onPress={onAddCategories} disabled={selectedCount === 0} />
          <button type="button" className="profile-text-btn" onClick={onClose}>
            {t("close")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CategoryModal;
