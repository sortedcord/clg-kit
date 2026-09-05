import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, radius, size } from './tokens';

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

  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.92, { damping: 14, stiffness: 240 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 14, stiffness: 240 });
  };

  return <Pressable
    testID={testID}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
    disabled={disabled}
    hitSlop={4}
    onPressIn={handlePressIn}
    onPressOut={handlePressOut}
    onPress={onPress}>
    <Animated.View style={[styles.base, toneStyles[tone], disabled && styles.disabled, animStyle, style]}>
      <Ionicons name={icon} size={size.icon} color={iconColor} />
    </Animated.View>
  </Pressable>;
}

const styles = StyleSheet.create({
  base: { width: size.touchTargetMin, height: size.touchTargetMin, borderRadius: radius.control, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.48 },
});
const toneStyles = StyleSheet.create({
  soft: { backgroundColor: colors.brand.cobaltSoft },
  sky: { backgroundColor: colors.brand.sky },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.semantic.danger.soft },
});
