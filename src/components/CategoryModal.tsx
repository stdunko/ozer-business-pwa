import { Check, Grid3x3, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CategoryType } from "../types/category";
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
  const selectedCount = selectedCategories.length;

  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">{t("selectCategories")}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t("close")}>
            <X size={22} />
          </button>
        </div>
        <p className="hint" style={{ padding: "0 24px", marginBottom: 8 }}>
          {selectedCount > 0 ? `${t("add")}: ${selectedCount}` : t("yourCategories")}
        </p>
        <div className="sheet-body">
          {categories.length === 0 ? (
            <p className="empty">{t("yourCategories")}</p>
          ) : (
            <div className="grid" style={{ padding: "8px 0 16px" }}>
              {categories.map((item) => {
                const isSelected = selectedCategories.some((cat) => cat.id === item.id);
                const icon = item.iconName || item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`category-card ${isSelected ? "selected" : ""}`}
                    onClick={() => onCategorySelect(item)}
                  >
                    <div className="category-icon">
                      {icon ? <img src={icon} alt="" /> : <Grid3x3 size={28} />}
                    </div>
                    <div className="category-name">{item.name}</div>
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
        <div className="sheet-footer" style={{ flexDirection: "column" }}>
          <PrimaryButton title={t("add")} onPress={onAddCategories} disabled={selectedCount === 0} />
          <PrimaryButton title={t("close")} variant="secondary" onPress={onClose} />
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
