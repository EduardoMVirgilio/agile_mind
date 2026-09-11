import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/classNames';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children, type = 'button', variant = 'primary', className = '', ...props
}, ref) => {
  const baseStyle =
    'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30',
    secondary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
    outline: 'border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10',
    ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
  };

  return (
    <button ref={ref} type={type} {...props} className={cx(baseStyle, variants[variant], className)}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';
