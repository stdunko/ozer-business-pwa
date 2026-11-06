import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import AppTextInput from "./AppTextInput";
import CountryFlag from "./CountryFlag";
import { COUNTRIES, POPULAR_COUNTRY_ISOS, type Country } from "../utils/countries";

type CountryPickerProps = {
  isVisible: boolean;
  selectedIso: string;
  onClose: () => void;
  onSelect: (country: Country) => void;
};

const CountryPicker = ({ isVisible, selectedIso, onClose, onSelect }: CountryPickerProps) => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");

  const displayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([i18n.language], { type: "region" });
    } catch {
      return new Intl.DisplayNames(["en"], { type: "region" });
    }
  }, [i18n.language]);

  const { popular, rest } = useMemo(() => {
    const query = search.trim().toLowerCase().replace(/^\+/, "");
    const withNames = COUNTRIES.map((country) => ({
      ...country,
      name: displayNames.of(country.iso) ?? country.iso,
    }));
    const matched = query
      ? withNames.filter(
          (country) =>
            country.name.toLowerCase().includes(query) ||
            country.iso.toLowerCase().includes(query) ||
            country.dial.includes(query)
        )
      : withNames;

    if (query) {
      return {
        popular: [] as typeof matched,
        rest: [...matched].sort((a, b) => a.name.localeCompare(b.name, i18n.language)),
      };
    }

    const popularIso = new Set(POPULAR_COUNTRY_ISOS);
    return {
      popular: POPULAR_COUNTRY_ISOS.map((iso) => matched.find((country) => country.iso === iso)).filter(
        (country): country is (typeof matched)[number] => Boolean(country)
      ),
      rest: matched
        .filter((country) => !popularIso.has(country.iso))
        .sort((a, b) => a.name.localeCompare(b.name, i18n.language)),
    };
  }, [displayNames, i18n.language, search]);

  const closePicker = () => {
    setSearch("");
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  const renderRow = (country: (typeof rest)[number]) => (
    <button
      key={`${country.iso}-${country.dial}`}
      type="button"
      className={`country-row ${country.iso === selectedIso ? "selected" : ""}`}
      onClick={() => {
        onSelect(country);
        setSearch("");
      }}
    >
      <span className="country-row-flag">
        <CountryFlag iso={country.iso} />
      </span>
      <span className="country-row-name">{country.name}</span>
      <span className="country-row-dial">+{country.dial}</span>
    </button>
  );

  return (
    <div className="modal-backdrop" onClick={closePicker}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">{t("selectCountry")}</h2>
          <button type="button" className="icon-btn" onClick={closePicker} aria-label={t("cancel")}>
            <X size={22} />
          </button>
        </div>
        <div className="country-search">
          <AppTextInput
            icon={Search}
            forceLtr={/^[+\d]/.test(search)}
            autoFocus
            placeholder={t("searchCountry")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sheet-body country-list">
          {popular.length === 0 && rest.length === 0 ? (
            <p className="empty">{t("countryNotFound")}</p>
          ) : (
            <>
              {popular.map(renderRow)}
              {popular.length > 0 && rest.length > 0 ? <div className="country-divider" /> : null}
              {rest.map(renderRow)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryPicker;
