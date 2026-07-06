import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost-dark" | "danger" | "subtle";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[15px] font-medium tracking-tight transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-sm hover:bg-accent-dark",
  secondary:
    "border border-line text-ink hover:border-ink/40 hover:bg-paper-raised",
  "ghost-dark":
    "border border-dark-foreground/20 text-dark-foreground hover:border-dark-foreground/40 hover:bg-dark-foreground/5",
  danger: "bg-danger text-white shadow-sm hover:bg-danger/90",
  subtle: "text-ink-soft hover:bg-paper-raised",
};

type LinkButtonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  href: LinkProps["href"];
  target?: string;
  rel?: string;
};

export function Button({
  variant = "primary",
  className,
  children,
  href,
  target,
  rel,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </Link>
  );
}

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function ButtonEl({
  variant = "primary",
  className,
  ...rest
}: NativeButtonProps) {
  return <button className={cn(base, variants[variant], className)} {...rest} />;
}
