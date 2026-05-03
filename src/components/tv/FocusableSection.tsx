import { useEffect, type ReactNode } from 'react';
import {
  FocusContext,
  useFocusable,
} from '@noriginmedia/norigin-spatial-navigation';

interface FocusableSectionProps {
  focusKey: string;
  children: ReactNode;
  autoFocus?: boolean;
  className?: string;
  onArrowPress?: (direction: string) => boolean;
  focusScrollOptions?: ScrollIntoViewOptions;
}

export function FocusableSection({
  focusKey,
  children,
  autoFocus = false,
  className,
  onArrowPress,
  focusScrollOptions,
}: FocusableSectionProps) {
  const { ref, focusSelf } = useFocusable({
    focusKey,
    trackChildren: true,
    onArrowPress,
    onFocus: () => {
      if (!focusScrollOptions) {
        return;
      }

      ref.current?.scrollIntoView(focusScrollOptions);
    },
  });

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const timer = window.setTimeout(() => {
      focusSelf();
    }, 80);

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoFocus, focusSelf]);

  return (
    <FocusContext.Provider value={focusKey}>
      <section ref={ref} className={className} data-nav-id={focusKey}>
        {children}
      </section>
    </FocusContext.Provider>
  );
}