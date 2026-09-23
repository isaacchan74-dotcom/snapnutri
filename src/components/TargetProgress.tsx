import { formatWhole } from '../lib/dates';
import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';

type TargetProgressProps = {
  label: string;
  current: number;
  target: number | null;
  unit: string;
  colorVar: '--color-primary' | '--color-protein' | '--color-carbs' | '--color-fat';
};

export function TargetProgress({ label, current, target, unit, colorVar }: TargetProgressProps) {
  const hasTarget = target != null && target > 0;
  const ratio = hasTarget ? current / target : 0;

  return (
    <div className="target-row">
      <div className="target-row__copy">
        <AppText as="span" variant="label" color="muted">
          {label}
        </AppText>
        <AppText as="span" variant="bodyStrong">
          {hasTarget
            ? `${formatWhole(current)} / ${formatWhole(target)} ${unit}`
            : `${formatWhole(current)} ${unit}`}
        </AppText>
      </div>
      <ProgressBar progress={ratio} colorVar={colorVar} fullWidth />
    </div>
  );
}
