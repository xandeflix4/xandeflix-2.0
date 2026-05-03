import { useMemo } from 'react';

import type { CatalogSection } from '../features/catalog/data/catalogSections';
import {
  CARD_SCROLL_OPTIONS,
  focusFirstMediaCard,
  focusHeaderLogoutButton,
  focusHeaderSearchButton,
  focusHeroInfoButton,
  focusHeroPlayButton,
  focusSidebarSearch,
  setFocusAndScroll,
} from '../lib/spatial/focusNavigation';
import { getCategoryItemFocusKey } from '../lib/spatial/categoryFocusKeys';

interface UseCatalogGridNavigationParams {
  columnsPerRow: number;
  sections: CatalogSection[];
}

export function useCatalogGridNavigation({
  columnsPerRow,
  sections,
}: UseCatalogGridNavigationParams) {
  return useMemo(() => {
    function getPreviousNonEmptyCategoryIndex(categoryIndex: number) {
      for (let index = categoryIndex - 1; index >= 0; index -= 1) {
        if (sections[index]?.items.length) {
          return index;
        }
      }

      return -1;
    }

    function getNextNonEmptyCategoryIndex(categoryIndex: number) {
      for (let index = categoryIndex + 1; index < sections.length; index += 1) {
        if (sections[index]?.items.length) {
          return index;
        }
      }

      return -1;
    }

    function focusCategoryItemByIndexes(
      categoryIndex: number,
      itemIndex: number,
    ) {
      const section = sections[categoryIndex];

      if (!section || !section.items[itemIndex]) {
        return false;
      }

      const focusKey = getCategoryItemFocusKey(section.id, itemIndex);

      console.log('[Xandeflix GenericNav] Focus category item', {
        categoryIndex,
        categoryId: section.id,
        itemIndex,
        focusKey,
      });

      return setFocusAndScroll({
        focusKey,
        scrollOptions: CARD_SCROLL_OPTIONS,
      });
    }

    function focusPreviousCategorySameColumn(
      categoryIndex: number,
      columnIndex: number,
    ) {
      const previousCategoryIndex =
        getPreviousNonEmptyCategoryIndex(categoryIndex);

      if (previousCategoryIndex < 0) {
        return focusHeroPlayButton();
      }

      const previousSection = sections[previousCategoryIndex];
      const previousItemsLength = previousSection.items.length;

      const previousRows = Math.ceil(previousItemsLength / columnsPerRow);
      const previousLastRowStartIndex = (previousRows - 1) * columnsPerRow;

      const targetItemIndex = Math.min(
        previousLastRowStartIndex + columnIndex,
        previousItemsLength - 1,
      );

      return focusCategoryItemByIndexes(
        previousCategoryIndex,
        targetItemIndex,
      );
    }

    function focusNextCategorySameColumn(
      categoryIndex: number,
      columnIndex: number,
    ) {
      const nextCategoryIndex = getNextNonEmptyCategoryIndex(categoryIndex);

      if (nextCategoryIndex < 0) {
        return false;
      }

      const nextSection = sections[nextCategoryIndex];
      const targetItemIndex = Math.min(
        columnIndex,
        nextSection.items.length - 1,
      );

      return focusCategoryItemByIndexes(nextCategoryIndex, targetItemIndex);
    }

    function handleCategoryCardArrowPress(
      direction: string,
      categoryIndex: number,
      itemIndex: number,
    ) {
      const section = sections[categoryIndex];

      if (!section) {
        return true;
      }

      const itemCount = section.items.length;
      const currentRowIndex = Math.floor(itemIndex / columnsPerRow);
      const columnIndex = itemIndex % columnsPerRow;

      if (direction === 'up') {
        if (currentRowIndex > 0) {
          const previousRowStartIndex =
            (currentRowIndex - 1) * columnsPerRow;

          const targetItemIndex = Math.min(
            previousRowStartIndex + columnIndex,
            itemCount - 1,
          );

          return focusCategoryItemByIndexes(categoryIndex, targetItemIndex);
        }

        return focusPreviousCategorySameColumn(categoryIndex, columnIndex);
      }

      if (direction === 'down') {
        const nextRowStartIndex = (currentRowIndex + 1) * columnsPerRow;

        if (nextRowStartIndex < itemCount) {
          const targetItemIndex = Math.min(
            nextRowStartIndex + columnIndex,
            itemCount - 1,
          );

          return focusCategoryItemByIndexes(categoryIndex, targetItemIndex);
        }

        return focusNextCategorySameColumn(categoryIndex, columnIndex);
      }

      return true;
    }

    function handleCategorySectionArrowPress(
      direction: string,
      categoryIndex: number,
    ) {
      if (direction === 'up') {
        return focusPreviousCategorySameColumn(categoryIndex, 0);
      }

      if (direction === 'down') {
        const currentSection = sections[categoryIndex];

        if (currentSection?.items.length) {
          return focusCategoryItemByIndexes(categoryIndex, 0);
        }

        return focusNextCategorySameColumn(categoryIndex, 0);
      }

      return true;
    }

    function handleCategorySeeAllArrowPress(
      direction: string,
      categoryIndex: number,
    ) {
      if (direction === 'up') {
        return focusPreviousCategorySameColumn(categoryIndex, 0);
      }

      if (direction === 'down') {
        return focusCategoryItemByIndexes(categoryIndex, 0);
      }

      return true;
    }

    return {
      handleHeroSectionArrowPress(direction: string) {
        if (direction === 'down') {
          return focusFirstMediaCard();
        }

        return true;
      },

      handleHeroPlayArrowPress(direction: string) {
        if (direction === 'up') {
          return focusHeaderSearchButton();
        }

        if (direction === 'down') {
          return focusFirstMediaCard();
        }

        return true;
      },

      handleHeroInfoArrowPress(direction: string) {
        if (direction === 'up') {
          return focusHeaderLogoutButton();
        }

        if (direction === 'down') {
          return focusFirstMediaCard();
        }

        return true;
      },

      handleHeaderSearchArrowPress(direction: string) {
        if (direction === 'left') {
          return focusSidebarSearch();
        }

        if (direction === 'down') {
          return focusHeroPlayButton();
        }

        return true;
      },

      handleHeaderProfileArrowPress(direction: string) {
        if (direction === 'down') {
          return focusHeroInfoButton();
        }

        return true;
      },

      handleHeaderLogoutArrowPress(direction: string) {
        if (direction === 'down') {
          return focusHeroInfoButton();
        }

        return true;
      },

      handleCategorySectionArrowPress,
      handleCategorySeeAllArrowPress,
      handleCategoryCardArrowPress,
    };
  }, [columnsPerRow, sections]);
}