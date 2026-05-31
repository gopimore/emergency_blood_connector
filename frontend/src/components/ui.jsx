import { cn } from '../lib/cn';

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) {
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-500',
    secondary: 'bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700',
    ghost: 'bg-transparent text-slate-300 border border-slate-600 hover:bg-slate-800',
    danger: 'bg-red-700 text-white hover:bg-red-600',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5',
  };
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, className }) {
  return (
    <label className={cn('flex flex-col gap-1.5 text-sm text-slate-400', className)}>
      {children}
    </label>
  );
}

export function Card({ children, className }) {
  return (
    <article className={cn('rounded-xl border border-slate-700 bg-slate-900 p-5', className)}>
      {children}
    </article>
  );
}

export function Alert({ children, variant = 'error' }) {
  const styles = {
    error: 'border-red-500/50 bg-red-500/10 text-red-200',
    success: 'border-green-500/50 bg-green-500/10 text-green-200',
  };
  return (
    <div className={cn('mb-4 rounded-lg border px-4 py-3 text-sm', styles[variant])}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-slate-800 text-slate-300',
    success: 'bg-green-500/20 text-green-400',
    danger: 'bg-red-500/20 text-red-300',
    primary: 'bg-red-600 text-white',
  };
  return (
    <span
      className={cn(
        'rounded px-2 py-0.5 text-xs font-medium capitalize',
        styles[variant]
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ children }) {
  return <p className="py-12 text-center text-slate-500">{children}</p>;
}

export function Spinner({ fullScreen }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'min-h-[50vh]' : 'py-12'
      )}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-red-500" />
    </div>
  );
}
