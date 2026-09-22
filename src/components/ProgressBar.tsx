type ProgressBarProps = {
  progress: number;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <div
      className="progress progress--wide"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
    >
      <div className="progress__fill" style={{ width: `${clamped * 100}%` }} />
    </div>
  );
}
