import { ComponentProps, ComponentType } from "react";
import clsx from "clsx";
import { LucideProps } from "lucide-react";

import styles from "./Input.module.css";

export type InputProps = ComponentProps<"input"> & {
  /**
   * Use icon to pass icon from lucide to display on the left side of the input
   */
  icon?: ComponentType<LucideProps>;
};

/**
 * Simple input component wrapping native input
 */
export function Input({ className, icon: Icon, ...props }: InputProps) {
  return (
    <div className={clsx(styles.wrapper, className)}>
      {Icon && <Icon className={clsx(styles.icon)} aria-hidden="true" />}
      <input className={styles.input} {...props} />
    </div>
  );
}

Input.displayName = "Input";

/**
 * Simple textarea component wrapping native textarea
 * (shares styles with input)
 */
export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={clsx(styles.textarea, className)} {...props} />;
}

TextArea.displayName = "TextArea";
