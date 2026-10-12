import type { ButtonHTMLAttributes, ReactNode } from "react";
import { primaryButtonClass } from "@/components/app/styles";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
  pendingLabel?: ReactNode;
};

export function ActionButton({
  pending = false,
  pendingLabel,
  children,
  className,
  disabled,
  type = "submit",
  ...props
}: Props) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={className ?? primaryButtonClass}
    >
      {pending ? <span className="cn-spinner" aria-hidden /> : null}
      {pending && pendingLabel != null ? pendingLabel : children}
    </button>
  );
}
