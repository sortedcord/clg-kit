import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { Card } from './card';
import { colors, radius, spacing } from './tokens';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ icon, title, message, action, style }: Props) {
  return <Card style={style} padding={spacing[7]}>
    <View style={styles.icon}><Ionicons name={icon} size={24} color={colors.brand.cobalt} /></View>
    <AppText variant="title" style={styles.title}>{title}</AppText>
    <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.message}>{message}</AppText>
    {action ? <View style={styles.action}>{action}</View> : null}
  </Card>;
}

const styles = StyleSheet.create({
  icon: { width: 48, height: 48, borderRadius: radius.control, backgroundColor: colors.brand.sky, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  title: { marginTop: spacing[4], textAlign: 'center' },
  message: { marginTop: spacing[2], textAlign: 'center' },
  action: { marginTop: spacing[5], alignSelf: 'stretch' },
});
