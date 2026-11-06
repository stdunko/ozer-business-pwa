type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
};

const PrimaryButton = ({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  className = "",
}: PrimaryButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      className={`btn btn-${variant} ${className}`}
      onClick={onPress}
      disabled={isDisabled}
    >
      {loading ? <span className="spinner" /> : title}
    </button>
  );
};

export default PrimaryButton;
