import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { colors, radius, size, spacing } from './tokens';

type Props = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Labeled input with visible instructions and a consistent focus/error treatment. */
export function FormField({ label, hint, error, containerStyle, editable = true, style, accessibilityLabel, accessibilityHint, onFocus, onBlur, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);
  return <View style={containerStyle}>
    <AppText variant="label" color={colors.neutral.textSecondary} style={styles.label}>{label}</AppText>
    <View style={[styles.inputWrap, focused && styles.inputFocused, error && styles.inputError, !editable && styles.inputDisabled]}>
      <TextInput
        {...inputProps}
        editable={editable}
        accessibilityLabel={accessibilityLabel || `${label}${error ? `. Error: ${error}` : ''}`}
        accessibilityHint={error || accessibilityHint || hint}
        placeholderTextColor={colors.neutral.textMuted}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        style={[styles.input, style]}
      />
      {error ? <Ionicons accessibilityElementsHidden name="alert-circle" size={18} color={colors.semantic.danger.text} /> : null}
    </View>
    {error ? <AppText variant="caption" color={colors.semantic.danger.text} style={styles.support}>{error}</AppText> : hint ? <AppText variant="caption" color={colors.neutral.textMuted} style={styles.support}>{hint}</AppText> : null}
  </View>;
}

const styles = StyleSheet.create({
  label: { marginBottom: spacing[2] },
  inputWrap: { minHeight: size.control, flexDirection: 'row', alignItems: 'center', borderRadius: radius.control, borderCurve: 'continuous', borderWidth: 1, borderColor: colors.neutral.border, backgroundColor: colors.neutral.surface, paddingHorizontal: spacing[4] },
  inputFocused: { borderColor: colors.brand.cobalt, borderWidth: 2, paddingHorizontal: spacing[3] + 1 },
  inputError: { borderColor: colors.semantic.danger.solid, borderWidth: 2, paddingHorizontal: spacing[3] + 1 },
  inputDisabled: { backgroundColor: colors.neutral.surfaceSubtle },
  input: { flex: 1, minHeight: size.control - 2, paddingVertical: 0, color: colors.neutral.textPrimary, fontFamily: 'Manrope_400Regular', fontSize: 15, lineHeight: 22 },
  support: { marginTop: spacing[1] },
});
