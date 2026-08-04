import { cn } from '@/lib/utils';

interface BlobBackgroundProps {
  className?: string;
  variant?: 'default' | 'auth' | 'subtle';
}

// Decorative floating gradient blobs used behind hero / auth sections.
export function BlobBackground({ className, variant = 'default' }: BlobBackgroundProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div
        className={cn(
          'absolute -left-32 top-[-10%] h-[420px] w-[420px] rounded-full blur-[120px] animate-blob',
          variant === 'auth' ? 'opacity-50' : 'opacity-40'
        )}
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.55), transparent 70%)' }}
      />
      <div
        className={cn(
          'absolute right-[-10%] top-[20%] h-[460px] w-[460px] rounded-full blur-[130px] animate-blob-rev',
          variant === 'auth' ? 'opacity-45' : 'opacity-35'
        )}
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)' }}
      />
      <div
        className={cn(
          'absolute left-[30%] bottom-[-15%] h-[400px] w-[400px] rounded-full blur-[120px] animate-float-slow',
          variant === 'subtle' ? 'opacity-20' : 'opacity-30'
        )}
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.4), transparent 70%)' }}
      />
      {/* subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
        }}
      />
    </div>
  );
}
