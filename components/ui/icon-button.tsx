import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import { colors, motion, radius, size } from './tokens';

type Tone = 'soft' | 'sky' | 'ghost' | 'danger';
type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  tone?: Tone;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function IconButton({ icon, label, onPress, tone = 'soft', disabled = false, style, testID }: Props) {
  const iconColor = tone === 'danger' ? colors.semantic.danger.text : tone === 'ghost' ? colors.neutral.textPrimary : colors.brand.cobalt;
  return <Pressable
    testID={testID}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
    disabled={disabled}
    hitSlop={4}
    onPress={onPress}
    style={({ pressed }) => [styles.base, toneStyles[tone], disabled && styles.disabled, pressed && !disabled && styles.pressed, style]}>
    <Ionicons name={icon} size={size.icon} color={iconColor} />
  </Pressable>;
}

const styles = StyleSheet.create({
  base: { width: size.touchTargetMin, height: size.touchTargetMin, borderRadius: radius.control, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.48 },
  pressed: { transform: [{ scale: motion.pressedScale }] },
});
const toneStyles = StyleSheet.create({
  soft: { backgroundColor: colors.brand.cobaltSoft },
  sky: { backgroundColor: colors.brand.sky },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.semantic.danger.soft },
});
