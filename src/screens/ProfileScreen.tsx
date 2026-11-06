import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, Grid3x3, Home, Mail, Phone, Plus, User, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setToken } from "../store/authSlice";
import { emptyExecutor, setExecutor } from "../store/executorSlice";
import { getCategories, updateExecutorInfo } from "../services/api";
import { storage } from "../utils/storage";
import { appConfig } from "../config";
import { useNotifier } from "../components/AppNotifier";
import AppHeader from "../components/AppHeader";
import AppTextInput from "../components/AppTextInput";
import CategoryModal from "../components/CategoryModal";
import IsWorkOnShabbat from "../components/IsWorkOnShabbat";
import MapView from "../components/MapView";
import PrimaryButton from "../components/PrimaryButton";
import SelectLanguage from "../components/SelectLanguage";
import type { CategoryType } from "../types/category";
import { validateProfileForm, type ProfileFieldKey } from "../utils/profileValidation";

const sameIds = (left: CategoryType[], right: CategoryType[]) => {
  const a = left.map((item) => item.id).sort((x, y) => x - y);
  const b = right.map((item) => item.id).sort((x, y) => x - y);
  return a.length === b.length && a.every((id, index) => id === b[index]);
};

const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showApiError, showSuccess } = useNotifier();
  const executor = useAppSelector((state) => state.executor);

  const [email, setEmail] = useState(executor.email || "");
  const [name, setName] = useState(executor.name || "");
  const [unp, setUnp] = useState<number | null>(executor.unp ?? null);
  const [adress, setAdress] = useState(executor.adress || "");
  const [isWorkInShhabat, setIsWorkOnShabbat] = useState(executor.isWorkInShhabat === false ? "no" : "yes");
  const [radius, setRadius] = useState(executor.radius || 0);
  const [latitude, setLatitude] = useState(executor.latitude || appConfig.defaultCoords.latitude);
  const [longitude, setLongitude] = useState(executor.longitude || appConfig.defaultCoords.longitude);
  const [mapSyncKey, setMapSyncKey] = useState(0);
  const [allCategories, setAllCategories] = useState<CategoryType[]>([]);
  const [updatedCategories, setUpdatedCategories] = useState<CategoryType[]>(executor.categories || []);
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProfileFieldKey, string>>>({});
  const [formError, setFormError] = useState("");

  const filteredCategories = useMemo(
    () => allCategories.filter((category) => !updatedCategories.some((item) => item.id === category.id)),
    [allCategories, updatedCategories]
  );

  useEffect(() => {
    setName(executor.name || "");
    setEmail(executor.email || "");
    setUnp(executor.unp ?? null);
    setAdress(executor.adress || "");
    setRadius(executor.radius || 0);
    setUpdatedCategories(executor.categories || []);
    setIsWorkOnShabbat(executor.isWorkInShhabat === false ? "no" : "yes");
    if (executor.latitude && executor.longitude) {
      setLatitude(executor.latitude);
      setLongitude(executor.longitude);
      setMapSyncKey((value) => value + 1);
    }
  }, [executor.id]);

  useEffect(() => {
    (async () => {
      const { response, error } = await getCategories();
      if (error) {
        showApiError(error, "errorLoadCategories");
        return;
      }
      const categories = (response?.data || []).map((category: CategoryType) => ({
        ...category,
        iconName: category.iconName || category.icon,
      }));
      setAllCategories(categories);
    })();
  }, [showApiError]);

  useEffect(() => {
    if (executor.latitude && executor.longitude) {
      return;
    }
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMapSyncKey((value) => value + 1);
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [executor.latitude, executor.longitude]);

  const clearFieldError = (field: ProfileFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const runValidation = () => {
    const validationErrors = validateProfileForm({
      name,
      email,
      latitude,
      longitude,
      radius,
      categoriesCount: updatedCategories.length,
    });
    const translated = Object.fromEntries(
      Object.entries(validationErrors).map(([field, key]) => [field, t(key)])
    ) as Partial<Record<ProfileFieldKey, string>>;
    setFieldErrors(translated);
    return Object.keys(translated).length === 0;
  };

  const onPressSave = async () => {
    setFormError("");
    if (!runValidation()) {
      return;
    }
    setSaveLoading(true);
    const { response, error } = await updateExecutorInfo(executor.id, {
      name: name.trim(),
      email: email.trim(),
      latitude,
      longitude,
      radius,
      categories: updatedCategories,
      unp,
      adress: adress.trim(),
      isWorkInShhabat: isWorkInShhabat === "yes",
    });
    if (!error && response?.data) {
      dispatch(setExecutor(response.data));
      setFieldErrors({});
      showSuccess("successProfileSaved");
    } else {
      showApiError(error, "profileSaveError");
      setFormError(t("profileSaveError"));
    }
    setSaveLoading(false);
  };

  const logOut = () => {
    storage.remove("token");
    dispatch(setToken(""));
    dispatch(setExecutor(emptyExecutor()));
  };

  const isFormChanged = () => {
    const originalShabbat = executor.isWorkInShhabat === false ? "no" : "yes";
    return (
      name.trim() !== (executor.name ?? "").trim() ||
      email.trim() !== (executor.email ?? "").trim() ||
      Number(latitude) !== Number(executor.latitude ?? 0) ||
      Number(longitude) !== Number(executor.longitude ?? 0) ||
      Math.round(Number(radius)) !== Math.round(Number(executor.radius ?? 0)) ||
      (unp ?? null) !== (executor.unp ?? null) ||
      adress.trim() !== (executor.adress ?? "").trim() ||
      isWorkInShhabat !== originalShabbat ||
      !sameIds(updatedCategories, executor.categories || [])
    );
  };

  return (
    <div className="screen">
      <AppHeader title={t("profile")} />
      <div className="scroll">
        {fieldErrors.location ? <p className="error-text pad">{fieldErrors.location}</p> : null}
        <div className={`map-wrap profile-map ${fieldErrors.location ? "map-error" : ""}`}>
          <MapView
            latitude={latitude}
            longitude={longitude}
            circleRadius={radius}
            onRegionChange={(region) => {
              setLatitude(region.latitude);
              setLongitude(region.longitude);
              clearFieldError("location");
            }}
            syncKey={mapSyncKey}
          />
          <img className="fake-marker" src="/maps-and-flags.png" alt="" />
        </div>

        <div className="pad">
          <div className="section-head">
            <h2 className="section-heading">{t("yourCategories")}</h2>
            <button type="button" className="add-chip" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              {t("add")}
            </button>
          </div>
          {fieldErrors.categories ? <p className="error-text">{fieldErrors.categories}</p> : null}
          {updatedCategories.length === 0 ? (
            <button
              type="button"
              className={`empty-cats ${fieldErrors.categories ? "input-error" : ""}`}
              onClick={() => setShowModal(true)}
            >
              <Grid3x3 size={28} />
              <span>{t("selectCategories")}</span>
            </button>
          ) : (
            <div className="chips">
              {updatedCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="chip active"
                  onClick={() => {
                    setUpdatedCategories((prev) => prev.filter((cat) => cat.id !== item.id));
                    clearFieldError("categories");
                  }}
                >
                  {item.name}
                  <X size={12} />
                </button>
              ))}
            </div>
          )}

          <div className="slider-block">
            <p>{t("radius")}</p>
            <input
              className="radius-slider"
              type="range"
              min={0}
              max={20000}
              value={radius}
              onChange={(e) => {
                setRadius(Number(e.target.value));
                clearFieldError("radius");
              }}
            />
            <p className="muted">{Math.round(radius)} m</p>
            {fieldErrors.radius ? <p className="error-text">{fieldErrors.radius}</p> : null}
          </div>

          <p className="section-heading" style={{ marginBottom: 8 }}>
            {t("IsWorkOnShabbat")}
          </p>
          <IsWorkOnShabbat isWorkOnShabbat={isWorkInShhabat} setIsWorkOnShabbat={setIsWorkOnShabbat} />

          <AppTextInput
            icon={User}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearFieldError("name");
              setFormError("");
            }}
            placeholder={t("name")}
            error={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name ? <p className="error-text">{fieldErrors.name}</p> : null}

          <AppTextInput
            icon={Mail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
              setFormError("");
            }}
            placeholder={t("email")}
            type="email"
            autoCapitalize="none"
            error={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email ? <p className="error-text">{fieldErrors.email}</p> : null}

          <AppTextInput icon={Phone} value={executor.phone} readOnly placeholder={t("phone")} />
          <AppTextInput
            icon={FileText}
            forceLtr
            inputMode="numeric"
            value={unp !== null ? String(unp) : ""}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/[^0-9]/g, "");
              setUnp(numericValue ? Number(numericValue) : null);
            }}
            placeholder={t("unp")}
          />
          <AppTextInput icon={Home} value={adress} onChange={(e) => setAdress(e.target.value)} placeholder={t("address")} />

          <SelectLanguage />
          {formError ? <p className="error-text" style={{ textAlign: "center" }}>{formError}</p> : null}
          <div style={{ height: 12 }} />
          <PrimaryButton
            title={t("confirm")}
            onPress={onPressSave}
            loading={saveLoading}
            disabled={saveLoading || !isFormChanged()}
          />
          <div style={{ height: 8 }} />
          <PrimaryButton title={t("logOut")} variant="secondary" onPress={logOut} />
          <div style={{ height: 8 }} />
          <PrimaryButton title={t("aboutTitle")} variant="secondary" onPress={() => navigate("/app/about")} />
        </div>
      </div>
      <CategoryModal
        isVisible={showModal}
        categories={filteredCategories}
        selectedCategories={selectedCategories}
        onCategorySelect={(category) => {
          setSelectedCategories((prev) =>
            prev.some((item) => item.id === category.id)
              ? prev.filter((item) => item.id !== category.id)
              : [...prev, category]
          );
        }}
        onAddCategories={() => {
          setUpdatedCategories((prev) => {
            const existing = new Set(prev.map((item) => item.id));
            return [...prev, ...selectedCategories.filter((item) => !existing.has(item.id))];
          });
          clearFieldError("categories");
          setShowModal(false);
          setSelectedCategories([]);
        }}
        onClose={() => {
          setShowModal(false);
          setSelectedCategories([]);
        }}
      />
    </div>
  );
};

export default ProfileScreen;
