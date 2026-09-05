import type { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AppText } from './app-text';
import { colors, size, spacing } from './tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'regular' | 'compact';
type HapticFeedback = 'none' | 'selection' | 'success' | 'light';
type Props = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  haptic?: HapticFeedback;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const feedback = (type: HapticFeedback) => {
  if (type === 'none' || Platform.OS === 'web') return;
  if (type === 'selection') void Haptics.selectionAsync();
  if (type === 'success') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  if (type === 'light') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export function Button({ label, onPress, variant = 'primary', size: buttonSize = 'regular', leading, trailing, disabled = false, loading = false, fullWidth = true, haptic = 'none', accessibilityHint, style, testID }: Props) {
  const unavailable = disabled || loading;
  const activeLabelColor = variant === 'primary' || variant === 'danger' ? colors.neutral.surface : colors.brand.cobalt;
  const labelColor = unavailable ? colors.neutral.textDisabled : activeLabelColor;
  const spinnerColor = unavailable ? colors.neutral.textDisabled : activeLabelColor;

  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (unavailable) return;
    scale.value = withSpring(0.96, { damping: 14, stiffness: 220 });
  };

  const handlePressOut = () => {
    if (unavailable) return;
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });
  };

  return <Pressable
    testID={testID}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityHint={accessibilityHint}
    accessibilityState={{ disabled: unavailable, busy: loading }}
    disabled={unavailable}
    onPressIn={handlePressIn}
    onPressOut={handlePressOut}
    onPress={(event) => { feedback(haptic); onPress(event); }}
    style={[fullWidth && styles.fullWidth]}>
    <Animated.View style={[styles.base, buttonSize === 'compact' && styles.compact, variantStyles[variant], fullWidth && styles.fullWidth, unavailable && styles.disabled, animStyle, style]}>
      {loading ? <ActivityIndicator color={spinnerColor} /> : <><View style={styles.icon}>{leading}</View><AppText variant="label" color={labelColor}>{label}</AppText><View style={styles.icon}>{trailing}</View></>}
    </Animated.View>
  </Pressable>;
}

const styles = StyleSheet.create({
  base: { minHeight: size.control, paddingHorizontal: spacing[5], borderRadius: 14, borderCurve: 'continuous', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2] },
  compact: { minHeight: 40, paddingHorizontal: spacing[4], borderRadius: 12, borderCurve: 'continuous' },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { backgroundColor: colors.neutral.surfaceSubtle, borderColor: colors.neutral.surfaceSubtle },
  icon: { minWidth: 0, alignItems: 'center', justifyContent: 'center' },
});
const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.brand.cobalt },
  secondary: { backgroundColor: colors.brand.cobaltSoft },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.semantic.danger.solid },
});
