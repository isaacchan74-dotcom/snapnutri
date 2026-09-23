import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatWhole } from '../lib/dates';
import { useTheme } from '../theme';

export type DayCalories = {
  label: string;
  calories: number;
};

type WeeklyCaloriesChartProps = {
  days: DayCalories[];
};

export function WeeklyCaloriesChart({ days }: WeeklyCaloriesChartProps) {
  const theme = useTheme();
  const hasAny = days.some((day) => day.calories > 0);

  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={days} margin={{ top: theme.spacing.sm, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.colors.textMuted, fontSize: theme.fontSize.xs }}
          />
          <YAxis hide domain={[0, (max: number) => Math.max(max, 1)]} />
          <Tooltip
            cursor={{ fill: theme.colors.surfaceMuted }}
            contentStyle={{
              background: theme.colors.surface,
              border: `${theme.borderWidth.hairline}px solid ${theme.colors.border}`,
              borderRadius: theme.radius.md,
              boxShadow: theme.shadows.soft,
              color: theme.colors.textPrimary,
              fontFamily: theme.fontFamily.sans,
              fontSize: theme.fontSize.sm,
            }}
            formatter={(value) => [`${formatWhole(Number(value ?? 0))} cal`, 'Calories']}
          />
          <Bar
            dataKey="calories"
            fill={theme.colors.primary}
            radius={[theme.radius.sm, theme.radius.sm, theme.radius.xs, theme.radius.xs]}
            maxBarSize={theme.spacing.xl}
          />
        </BarChart>
      </ResponsiveContainer>
      {!hasAny ? (
        <div className="chart-frame__empty">
          <span className="text text--caption text--muted">No meals this week yet — bars stay sleepy.</span>
        </div>
      ) : null}
    </div>
  );
}
