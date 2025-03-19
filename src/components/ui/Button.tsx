import React, { ComponentProps } from 'react';
import clsx from 'clsx';
// ⇩ Slot component is used to pass the children to the any other element that we might want to use instead of the button
// import { Slot } from "@radix-ui/react-slot";

import styles from './Button.module.css';
import { Slot } from '@radix-ui/react-slot';
import { VisuallyHidden } from './VisuallyHidden';

export type ButtonProps = ComponentProps<'button'> & {
  /**
   * The visual style variant of the button
   * @default "secondary"
   */
  variant?:
    | 'accent'
    | 'primary'
    | 'destructive'
    | 'ghost'
    | 'highlight'
    | 'secondary';

  asChild?: boolean;
};

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  asChild = false,
  ...props
}: ButtonProps) => {
  // We can use slot like this
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={clsx(styles.button, styles[variant], className)}
      {...props}
    >
      {children}
    </Comp>
  );
};

Button.displayName = 'Button';

type IconButtonProps = ComponentProps<typeof Button> & {
  label: string;
};

export const IconButton = ({
  children,
  className,
  label,
  ...props
}: IconButtonProps) => {
  return (
    <Button
      {...props}
      className={clsx(styles.icon, className)}
      aria-label={label}
    >
      {children}
    </Button>
  );
};
