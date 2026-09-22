import { AppText } from './AppText';
import { Card } from './Card';

type StatTileProps = {
  label: string;
  value: string;
  unit?: string;
  accentVar?: '--color-protein' | '--color-carbs' | '--color-fat' | '--color-primary';
};

export function StatTile({ label, value, unit, accentVar = '--color-primary' }: StatTileProps) {
  return (
    <Card padding="sm" className="stat-tile card--flat">
      <div className="stat-tile__stripe" style={{ background: `var(${accentVar})` }} />
      <AppText variant="label" color="muted">
        {label}
      </AppText>
      <div className="stat-tile__value">
        <AppText as="span" variant="heading">
          {value}
        </AppText>
        {unit ? (
          <AppText as="span" variant="caption" color="secondary">
            {unit}
          </AppText>
        ) : null}
      </div>
    </Card>
  );
}
