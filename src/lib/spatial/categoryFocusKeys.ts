export function getCategorySectionFocusKey(categoryId: string) {
  return `catalog-section-${categoryId}`;
}

export function getCategorySeeAllFocusKey(categoryId: string) {
  return `catalog-section-${categoryId}-see-all`;
}

export function getCategoryItemFocusKey(categoryId: string, itemIndex: number) {
  return `catalog-section-${categoryId}-item-${itemIndex}`;
}