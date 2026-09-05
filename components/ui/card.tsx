import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from './tokens';

type CardTone = 'surface' | 'sky' | 'skySoft' | 'cobaltSoft' | 'coralSoft';
type Props = { children: ReactNode; tone?: CardTone; style?: StyleProp<ViewStyle>; padding?: number; testID?: string };

const toneStyle = {
  surface: { backgroundColor: colors.neutral.surface, borderWidth: 1, borderColor: colors.neutral.border },
  sky: { backgroundColor: colors.brand.sky },
  skySoft: { backgroundColor: colors.brand.skySoft },
  cobaltSoft: { backgroundColor: colors.brand.cobaltSoft },
  coralSoft: { backgroundColor: colors.brand.coralSoft },
} as const;

/** Flat grouped surface. Floating elevation is intentionally reserved for overlays. */
export function Card({ children, tone = 'surface', padding = spacing[5], style, testID }: Props) {
  return <View testID={testID} style={[styles.base, toneStyle[tone], { padding }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.card, borderCurve: 'continuous' },
});
