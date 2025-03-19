import { Slot } from "@radix-ui/react-slot";
import { ComponentProps } from "react";
import clsx from "clsx";

import styles from "./VisuallyHidden.module.css";

export type VisuallyHiddenProps = ComponentProps<"span"> & {
  /**
   * Whether to use the asChild pattern from Radix UI
   * @default false
   */
  asChild?: boolean;
};

/**
 * VisuallyHidden component that hides content visually but keeps it accessible to screen readers
 *
 * @example
 * ```tsx
 * // Basic usage
 * <VisuallyHidden>This text is hidden visually but read by screen readers</VisuallyHidden>
 *
 * // With polymorphism using asChild
 * <VisuallyHidden asChild>
 *   <h2>This heading is hidden visually but maintains its semantic structure</h2>
 * </VisuallyHidden>
 * ```
 */
export function VisuallyHidden({
  asChild = false,
  className,
  ...props
}: VisuallyHiddenProps) {
  // Use Slot for polymorphism when asChild is true, otherwise use span
  const Component = asChild ? Slot : "span";

  return <Component className={clsx(styles.hidden, className)} {...props} />;
}

VisuallyHidden.displayName = "VisuallyHidden";
