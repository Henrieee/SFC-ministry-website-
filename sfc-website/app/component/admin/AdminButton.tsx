import { ButtonHTMLAttributes } from "react";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function AdminButton({ variant = "primary", className, ...props }: Props) {
  const base = "rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider transition active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[var(--sfc-red)] text-white hover:brightness-110",
    secondary: "bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--border)]",
    danger: "bg-transparent border border-[var(--border)] text-red-400 hover:bg-red-950/20",
    ghost: "bg-transparent text-[var(--text-dim)] hover:text-[var(--text)]"
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}