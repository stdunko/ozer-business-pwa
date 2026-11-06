import { useTranslation } from "react-i18next";

type IsWorkOnShabbatProps = {
  isWorkOnShabbat: string | null;
  setIsWorkOnShabbat: (value: string) => void;
};

const IsWorkOnShabbat = ({ isWorkOnShabbat, setIsWorkOnShabbat }: IsWorkOnShabbatProps) => {
  const { t } = useTranslation();
  const options = [
    { value: "yes", label: t("yes") },
    { value: "no", label: t("no") },
  ];

  return (
    <div className="radio-group">
      {options.map((option) => (
        <label key={option.value} className="radio-row">
          <input
            type="radio"
            name="shabbat"
            checked={isWorkOnShabbat === option.value}
            onChange={() => setIsWorkOnShabbat(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default IsWorkOnShabbat;
