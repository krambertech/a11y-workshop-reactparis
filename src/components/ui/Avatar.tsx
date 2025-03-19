import { ComponentProps } from "react";
import clsx from "clsx";

import styles from "./Avatar.module.css";

type AvatarProps = Omit<ComponentProps<"img">, "size"> & {
  name?: string;
  size?: "small" | "medium" | "large";
};

function Avatar({ size = "medium", className, name, ...props }: AvatarProps) {
  return (
    <img
      className={clsx(styles.avatar, className)}
      data-size={size}
      alt={name}
      {...props}
    />
  );
}

export { Avatar, type AvatarProps };
