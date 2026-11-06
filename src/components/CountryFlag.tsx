const FLAG_FILES = import.meta.glob<string>("../../node_modules/flag-icons/flags/4x3/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const flagByIso = Object.fromEntries(
  Object.entries(FLAG_FILES).flatMap(([path, url]) => {
    const iso = path.match(/\/([a-z]{2})\.svg$/i)?.[1]?.toLowerCase();
    return iso ? [[iso, url]] : [];
  })
);

const CountryFlag = ({ iso, className = "" }: { iso: string; className?: string }) => {
  const src = flagByIso[iso.toLowerCase()];
  if (!src) {
    return <span className={`country-flag country-flag-fallback ${className}`}>{iso}</span>;
  }

  return (
    <img
      className={`country-flag ${className}`}
      src={src}
      alt=""
      width={24}
      height={18}
      draggable={false}
    />
  );
};

export default CountryFlag;
