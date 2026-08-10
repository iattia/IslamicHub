import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent/90 dark:text-canvas",
        secondary:
          "border border-line bg-panel/70 text-ink hover:border-accent/40 hover:bg-sand",
        ghost: "text-muted hover:bg-sand hover:text-ink",
        quiet: "text-muted underline-offset-4 hover:text-ink hover:underline",
      },
      size: { sm: "h-9 px-3", md: "h-11 px-4", lg: "h-12 px-5" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
