import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from './app-text';
import { IconButton } from './icon-button';
import { colors, radius, shadow, spacing } from './tokens';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Shared modal sheet with keyboard-safe padding and a single accessible close control. */
export function BottomSheet({ visible, title, onClose, children, footer, style, testID }: Props) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Close ${title}`} style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <SafeAreaView edges={['bottom']} accessibilityViewIsModal style={[styles.sheet, style]} testID={testID}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="heading3">{title}</AppText>
            <IconButton icon="close" label={`Close ${title}`} tone="ghost" onPress={onClose} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>{children}</ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.neutral.scrim },
  backdrop: { ...StyleSheet.absoluteFillObject },
  keyboard: { width: '100%', maxHeight: '92%' },
  sheet: { borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, backgroundColor: colors.neutral.surface, paddingHorizontal: spacing[6], paddingTop: spacing[3], ...shadow.floating },
  handle: { width: 36, height: 4, alignSelf: 'center', borderRadius: radius.pill, backgroundColor: colors.neutral.border },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[4] },
  body: { paddingBottom: spacing[5] },
  footer: { paddingTop: spacing[3], paddingBottom: spacing[3], borderTopWidth: 1, borderTopColor: colors.neutral.divider },
});
