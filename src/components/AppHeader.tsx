import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRtl } from "../hooks/useRtl";
import LanguageSwitcher from "./LanguageSwitcher";

type AppHeaderProps = {
  title: string;
  back?: boolean;
  right?: ReactNode;
};

const AppHeader = ({ title, back, right }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { isRtl } = useRtl();

  return (
    <header className="header">
      <div className="header-side">
        <LanguageSwitcher />
        {back ? (
          <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">
            <ChevronLeft size={26} style={{ transform: isRtl ? "scaleX(-1)" : undefined }} />
          </button>
        ) : null}
      </div>
      <h1 className="header-title">{title}</h1>
      <div className="header-side end">{right}</div>
    </header>
  );
};

export default AppHeader;
