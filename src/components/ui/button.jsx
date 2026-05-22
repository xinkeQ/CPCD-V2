import React from "react";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";
  const variantClass =
    variant === "outline"
      ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      : variant === "ghost"
        ? "bg-transparent text-slate-600 hover:bg-slate-100"
        : "bg-slate-900 text-white hover:bg-slate-800";
  const sizeClass = size === "icon" ? "h-9 w-9" : "px-4 py-2";

  return (
    <button type={type} className={cn(base, variantClass, sizeClass, className)} {...props}>
      {children}
    </button>
  );
}
