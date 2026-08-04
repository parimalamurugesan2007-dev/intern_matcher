import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: 'default' | 'lg' | 'sm';
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const sizes = {
  default: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
  sm: 'h-9 px-4 text-sm',
};

export function GradientButton({
  children,
  to,
  href,
  onClick,
  className,
  size = 'default',
  type = 'button',
  disabled,
}: GradientButtonProps) {
  const classes = cn(
    'group relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-white',
    'bg-brand-gradient bg-[length:200%_200%] transition-all duration-300',
    'hover:bg-brand-gradient-hover hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.6)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]',
    'disabled:pointer-events-none disabled:opacity-50',
    sizes[size],
    className
  );

  const content = (
    <>
      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
