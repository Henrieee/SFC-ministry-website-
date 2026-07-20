import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AdminInput({ label, ...props }: Props) {
  return (
    <div>
      <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1 pl-1">
        {label}
      </label>
      <input
        className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition"
        {...props}
      />
    </div>
  );
}