import { ComponentProps } from "react";
// ⇩ icons
// import { CircleX, CheckCircle, Info } from "lucide-react";
import clsx from "clsx";

import styles from "./Banner.module.css";

export type BannerProps = ComponentProps<"div"> & {
  /**
   * The visual style variant of the banner
   * @default "info"
   */
  variant?: "error" | "success" | "info";
};

export function Banner({
  variant = "info",
  className,
  children,
  ...props
}: BannerProps) {
  return (
    <div
      className={clsx(styles.banner, className)}
      data-variant={variant}
      {...props}
    >
      {children}
    </div>
  );
}
