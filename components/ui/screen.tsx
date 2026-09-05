import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, size, spacing } from './tokens';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Consistent canvas, safe-area behavior, horizontal gutter, readable content width, and smooth onLoad transition. */
export function Screen({ children, scroll = true, edges = ['top'], style, contentContainerStyle, testID }: Props) {
  const { width } = useWindowDimensions();
  const responsiveGutter = width >= 430 ? size.screenGutterWide : size.screenGutter;
  const content = scroll ? (
    <ScrollView
      testID={testID}
      style={styles.scroll}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, { paddingHorizontal: responsiveGutter }, contentContainerStyle, { paddingBottom: size.tabBar + spacing[6] }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <Animated.View entering={FadeIn.duration(280)} style={styles.animWrap}>
        {children}
      </Animated.View>
    </ScrollView>
  ) : (
    <Animated.View entering={FadeIn.duration(280)} testID={testID} style={[styles.content, styles.fill, { paddingHorizontal: responsiveGutter }, contentContainerStyle]}>
      {children}
    </Animated.View>
  );

  return <SafeAreaView edges={edges} style={[styles.safe, style]}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.canvas },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: size.contentMaxWidth, alignSelf: 'center', paddingTop: spacing[5], paddingBottom: spacing[8] },
  animWrap: { width: '100%' },
  fill: { flex: 1 },
});
