import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from './ThemeProvider';
import type { Theme } from './theme';

type NamedStyles = Parameters<typeof StyleSheet.create>[0];

/**
 * Builds a StyleSheet from the active theme and rebuilds it when the mode changes.
 *
 * Define the factory at module scope (not inline in the component) so the
 * memo actually holds between renders.
 */
export function useThemedStyles<T extends NamedStyles>(factory: (theme: Theme) => T) {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [factory, theme]);
}
