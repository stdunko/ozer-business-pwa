import type { CSSProperties, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { useRtl } from "../hooks/useRtl";

type AppTextInputProps = {
  icon?: LucideIcon;
  forceLtr?: boolean;
  error?: boolean;
  multiline?: boolean;
  className?: string;
  style?: CSSProperties;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "style"> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "style">;

const AppTextInput = ({
  icon: Icon,
  forceLtr,
  error,
  multiline,
  className = "",
  style,
  ...rest
}: AppTextInputProps) => {
  const { isRtl, textAlign } = useRtl();
  const useRtlInput = isRtl && !forceLtr;
  const extra = `${Icon ? "has-icon" : ""} ${error ? "input-error" : ""} ${className}`;
  const dirStyle: CSSProperties = {
    textAlign: forceLtr ? "left" : textAlign,
    direction: useRtlInput ? "rtl" : "ltr",
    ...style,
  };

  return (
    <div className="field">
      {Icon ? (
        <span className="field-icon">
          <Icon size={20} />
        </span>
      ) : null}
      {multiline ? (
        <textarea className={`textarea ${extra}`} style={dirStyle} {...rest} />
      ) : (
        <input className={`input ${extra}`} style={dirStyle} {...rest} />
      )}
    </div>
  );
};

export default AppTextInput;
