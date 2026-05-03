import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';

import { cn } from '../../utils/cn';

interface FocusableButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  focusKey: string;
  children: ReactNode;
  onEnterPress?: () => void;
  onArrowPress?: (direction: string) => boolean;
}

export function FocusableButton({
  focusKey,
  children,
  className,
  onClick,
  onEnterPress,
  onArrowPress,
  ...props
}: FocusableButtonProps) {
  const { ref, focused } = useFocusable({
    focusKey,
    onArrowPress,
    onFocus: () => {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    },
    onEnterPress: () => {
      if (onEnterPress) {
        onEnterPress();
        return;
      }

      if (onClick) {
        const virtualEvent = {
          preventDefault: () => undefined,
          stopPropagation: () => undefined,
        } as React.MouseEvent<HTMLButtonElement>;

        onClick(virtualEvent);
      }
    },
  });

  return (
    <button
      ref={ref}
      className={cn('tv-focusable', className)}
      type="button"
      data-focused={focused ? 'true' : undefined}
      data-nav-id={focusKey}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}