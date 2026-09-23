type ProgressBarProps = {
  progress: number;
  colorVar?: '--color-primary' | '--color-protein' | '--color-carbs' | '--color-fat';
  fullWidth?: boolean;
};

export function ProgressBar({
  progress,
  colorVar = '--color-primary',
  fullWidth = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <div
      className={fullWidth ? 'progress progress--full' : 'progress progress--wide'}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
    >
      <div
        className="progress__fill"
        style={{ width: `${clamped * 100}%`, background: `var(${colorVar})` }}
      />
    </div>
  );
}
