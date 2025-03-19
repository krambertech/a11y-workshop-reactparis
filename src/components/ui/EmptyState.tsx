import { ComponentProps } from "react";
import clsx from "clsx";
import { CircleX, LucideProps } from "lucide-react";

import styles from "./EmptyState.module.css";

export type EmptyStateProps = ComponentProps<"div"> & {
  icon?: React.ComponentType<LucideProps>;
  /**
   * The visual style variant of the empty state
   * @default "info"
   */
  variant?: "error" | "info";
};

/**
 * Empty state component
 * for any full page messages
 */
export const EmptyState = ({
  className,
  children,
  variant = "info",
  ...props
}: EmptyStateProps) => {
  const Icon = props.icon || CircleX;

  return (
    <div
      className={clsx(styles.emptyState, className)}
      // ⇩ data attribute is used for styling
      data-variant={variant}
      {...props}
    >
      <Icon strokeWidth={1.5} />
      <p>{children}</p>
    </div>
  );
};

EmptyState.displayName = "EmptyState";
