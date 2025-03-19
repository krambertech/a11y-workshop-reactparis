import { ComponentProps } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import * as RadixAlertDialog from "@radix-ui/react-alert-dialog";
import clsx from "clsx";

import styles from "./Dialog.module.css";
import { Button } from "./Button";

/**
 * Dialog component built on top of Radix UI Dialog
 * Provides an accessible modal dialog window
 */
export function Dialog({
  open,
  onOpenChange,
  children,
}: ComponentProps<typeof RadixDialog.Root>) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog.Root>
  );
}

/**
 * The button that opens the dialog
 */
export function DialogTrigger({
  children,
  ...props
}: ComponentProps<typeof RadixDialog.Trigger>) {
  return (
    <RadixDialog.Trigger asChild {...props}>
      {children}
    </RadixDialog.Trigger>
  );
}

/**
 * The content of the dialog
 */
export function DialogContent({
  children,
  className,
  ...props
}: ComponentProps<typeof RadixDialog.Content>) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={styles.overlay}>
        <RadixDialog.Content
          className={clsx(styles.content, className)}
          {...props}
        >
          {children}
        </RadixDialog.Content>
      </RadixDialog.Overlay>
    </RadixDialog.Portal>
  );
}

type DialogHeaderProps = ComponentProps<"header">;

/**
 * Header section of the dialog
 */
export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <header className={clsx(styles.header, className)} {...props} />;
}

/**
 * Title of the dialog - this is announced to screen readers
 */
export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title className={clsx(styles.title, className)} {...props} />
  );
}

/**
 * Description of the dialog - this is announced to screen readers
 */
export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

/**
 * Footer section of the dialog, typically contains action buttons
 */

type DialogFooterProps = ComponentProps<"div">;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <footer className={clsx(styles.footer, className)} {...props} />;
}

export function DialogClose({
  ...props
}: ComponentProps<typeof RadixDialog.Close>) {
  return <RadixDialog.Close asChild {...props} />;
}

// Export all components
Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Footer = DialogFooter;
Dialog.Close = DialogClose;

//
//
// Alert Dialog
//
//

type AlertDialogProps = ComponentProps<typeof RadixAlertDialog.Root>;

export function AlertDialog({ children, ...props }: AlertDialogProps) {
  return <RadixAlertDialog.Root {...props}>{children}</RadixAlertDialog.Root>;
}

type AlertDialogTriggerProps = ComponentProps<typeof RadixAlertDialog.Trigger>;

export function AlertDialogTrigger({
  children,
  ...props
}: AlertDialogTriggerProps) {
  return (
    <RadixAlertDialog.Trigger {...props} asChild>
      {children}
    </RadixAlertDialog.Trigger>
  );
}

/**
 * The content of the alert dialog
 */
export function AlertDialogContent({
  children,
  className,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Content>) {
  return (
    <RadixAlertDialog.Portal>
      <RadixAlertDialog.Overlay className={styles.overlay}>
        <RadixAlertDialog.Content
          className={clsx(styles.content, styles.alert, className)}
          {...props}
        >
          {children}
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Overlay>
    </RadixAlertDialog.Portal>
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Title>) {
  return (
    <RadixAlertDialog.Title
      className={clsx(styles.title, className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Description>) {
  return (
    <RadixAlertDialog.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

export function AlertDialogAction({
  children,
  asChild,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Action>) {
  return (
    <RadixAlertDialog.Action asChild {...props}>
      {asChild ? (
        children
      ) : (
        <Button variant="destructive" {...props}>
          {children}
        </Button>
      )}
    </RadixAlertDialog.Action>
  );
}

export function AlertDialogCancel({
  children,
  asChild,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Cancel>) {
  return (
    <RadixAlertDialog.Cancel asChild {...props}>
      {asChild ? (
        children
      ) : (
        <Button variant="ghost" {...props}>
          {children}
        </Button>
      )}
    </RadixAlertDialog.Cancel>
  );
}

export function AlertDialogFooter({
  className,
  ...props
}: ComponentProps<"div">) {
  return <footer className={clsx(styles.footer, className)} {...props} />;
}

// Export all components
AlertDialog.Trigger = AlertDialogTrigger;
AlertDialog.Content = AlertDialogContent;
AlertDialog.Title = AlertDialogTitle;
AlertDialog.Description = AlertDialogDescription;
AlertDialog.Action = AlertDialogAction;
AlertDialog.Cancel = AlertDialogCancel;
AlertDialog.Footer = AlertDialogFooter;
