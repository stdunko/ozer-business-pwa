import { useState } from "react";
import {
  Bed,
  Bike,
  Car,
  Droplets,
  Zap,
  Hammer,
  Laptop,
  LayoutGrid,
  Leaf,
  PawPrint,
  Palette,
  School,
  Shirt,
  Snowflake,
  Sparkles,
  Tv,
  type LucideIcon,
} from "lucide-react";

const SLUG_ICON: Record<string, LucideIcon> = {
  santehnika: Droplets,
  elektrika: Zap,
  uborka: Sparkles,
  pereezd: Car,
  sadovnik: Leaf,
  remont: Hammer,
  kondicionery: Snowflake,
  "sborka-mebeli": Bed,
  "pokraska-otdelka": Palette,
  "okna-dveri": LayoutGrid,
  "bytovaya-tehnika": Tv,
  "kompyuternaya-pomosh": Laptop,
  himchistka: Shirt,
  zhivotnye: PawPrint,
  repetitory: School,
  "kurier-porucheniya": Bike,
};

const NAME_ICON: Record<string, LucideIcon> = {
  "сборка мебели": Bed,
  "покраска и отделка": Palette,
  "окна и двери": LayoutGrid,
  "ремонт бытовой техники": Tv,
  "компьютерная помощь": Laptop,
  "химчистка и мягкая мебель": Shirt,
  "уход за животными": PawPrint,
  "репетиторы и уроки": School,
  "курьер и поручения": Bike,
};

type CategoryIconProps = {
  iconUrl?: string | null;
  categoryName?: string;
  size?: number;
};

const CategoryIcon = ({ iconUrl, categoryName = "", size = 28 }: CategoryIconProps) => {
  const [remoteFailed, setRemoteFailed] = useState(false);
  const slug = iconUrl?.match(/category-([a-z0-9-]+)\./i)?.[1];
  const Icon = (slug && SLUG_ICON[slug]) || NAME_ICON[categoryName.trim().toLowerCase()] || LayoutGrid;
  const showRemote = Boolean(iconUrl?.startsWith("http")) && !remoteFailed;
  const remoteUri = iconUrl ? `${iconUrl}${iconUrl.includes("?") ? "&" : "?"}v=2` : undefined;

  if (showRemote && remoteUri) {
    return <img src={remoteUri} alt="" width={size} height={size} onError={() => setRemoteFailed(true)} />;
  }

  return <Icon size={size} />;
};

export default CategoryIcon;
