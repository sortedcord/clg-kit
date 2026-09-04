import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, type, type TypeVariant } from './tokens';

type Props = TextProps & {
  variant?: TypeVariant;
  color?: string;
};

/** A semantic Manrope text primitive with accessible defaults. */
export function AppText({ variant = 'body', color = colors.neutral.textPrimary, style, ...props }: Props) {
  return <Text {...props} style={[type[variant], { color }, style as TextStyle]} />;
}
