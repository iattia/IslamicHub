import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50', { variants: { variant: { primary: 'bg-ink text-canvas hover:opacity-90', secondary: 'border border-line bg-panel text-ink hover:bg-sand', ghost: 'text-muted hover:bg-sand hover:text-ink', quiet: 'text-muted underline-offset-4 hover:text-ink hover:underline' }, size: { sm: 'h-9 px-3', md: 'h-11 px-4', lg: 'h-12 px-5' } }, defaultVariants: { variant: 'primary', size: 'md' } });
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />);
Button.displayName = 'Button';
