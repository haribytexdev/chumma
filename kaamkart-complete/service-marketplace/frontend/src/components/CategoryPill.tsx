import { ServiceCategory, CATEGORY_LABELS, CATEGORY_ICONS } from "../types";

export function CategoryPill({ category }: { category: ServiceCategory }) {
  return (
    <span className="pill">
      <span>{CATEGORY_ICONS[category]}</span>
      {CATEGORY_LABELS[category]}
    </span>
  );
}
