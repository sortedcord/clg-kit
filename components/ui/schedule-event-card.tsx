import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AppText } from './app-text';
import { colors, radius, spacing, type SubjectTone } from './tokens';

export type ClassAttendanceState = 'pending' | 'attended' | 'absent' | 'cancelled';
type Props = {
  title: string;
  timeRange: string;
  subjectTone: SubjectTone;
  room?: string;
  kind?: string;
  classType?: string;
  state?: ClassAttendanceState;
  isNow?: boolean;
  topAction?: ReactNode;
  footer?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Editorial calendar block: subject color leads; attendance changes only the card state. */
export function ScheduleEventCard({ title, timeRange, subjectTone, room, kind, classType = 'Lecture', state = 'pending', isNow = false, topAction, footer, onPress, style, testID }: Props) {
  const subject = colors.subject[subjectTone];
  const cancelled = state === 'cancelled';
  const absent = state === 'absent';
  const attended = state === 'attended';
  const backgroundColor = cancelled ? colors.neutral.surfaceSubtle : absent ? colors.semantic.danger.soft : subject.surface;
  const foreground = cancelled ? colors.neutral.textMuted : absent ? colors.semantic.danger.text : subject.accent;

  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!onPress) return;
    scale.value = withSpring(0.97, { damping: 14, stiffness: 240 });
  };

  const handlePressOut = () => {
    if (!onPress) return;
    scale.value = withSpring(1, { damping: 14, stiffness: 240 });
  };

  const content = <>
    <View style={styles.titleRow}>
      <AppText variant="title" color={foreground} numberOfLines={2} style={styles.title}>{title}</AppText>
      {topAction ? <View style={styles.topAction}>{topAction}</View> : null}
    </View>
    <View style={styles.meta}>
      <AppText variant="bodySmall" color={foreground} numberOfLines={1} style={styles.code}>{kind || 'Class'}</AppText>
      {room ? <View style={styles.room}><AppText variant="bodySmall" color={cancelled ? colors.neutral.textMuted : colors.neutral.textSecondary} numberOfLines={1}>{room}</AppText></View> : null}
    </View>
    <View style={styles.bottomRow}>
      <View style={styles.typeRow}>
        <Ionicons name="school-outline" size={14} color={foreground} />
        <AppText variant="label" color={foreground}>{classType}</AppText>
      </View>
      {isNow ? (
        <View style={styles.now}><AppText variant="caption" color={colors.brand.ink}>Now</AppText></View>
      ) : cancelled ? (
        <AppText variant="label" color={colors.neutral.textMuted}>Cancelled</AppText>
      ) : attended ? (
        <View style={styles.statusConfirmed}>
          <Ionicons name="checkmark-circle" size={15} color={colors.semantic.success.solid} />
          <AppText variant="label" color={colors.semantic.success.text}>Attended</AppText>
        </View>
      ) : absent ? (
        <View style={styles.statusConfirmed}>
          <Ionicons name="close-circle" size={15} color={colors.semantic.danger.solid} />
          <AppText variant="label" color={colors.semantic.danger.text}>Absent</AppText>
        </View>
      ) : (
        <ParticipantStack accent={foreground} />
      )}
    </View>
    {footer ? <View style={styles.footer}>{footer}</View> : null}
  </>;

  const cardStyle = [styles.card, { backgroundColor }, cancelled && styles.cancelled, style];

  if (!onPress) {
    return <View testID={testID} accessibilityLabel={`${title}, ${timeRange}${room ? `, ${room}` : ''}`} style={cardStyle}>{content}</View>;
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${timeRange}${room ? `, ${room}` : ''}`}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}>
      <Animated.View style={[cardStyle, animStyle]}>
        {content}
      </Animated.View>
    </Pressable>
  );
}

function ParticipantStack({ accent }: { accent: string }) {
  return <View accessibilityLabel="Three classmates and eight more" style={styles.participants}>
    {['A', 'K', 'S'].map((initial, index) => <View key={initial} style={[styles.avatar, { backgroundColor: index === 0 ? colors.brand.sky : index === 1 ? colors.subject.lilac.surface : colors.subject.peach.surface, marginLeft: index ? -spacing[2] : 0 }]}>
      <AppText variant="caption" color={accent}>{initial}</AppText>
    </View>)}
    <AppText variant="label" color={accent} style={styles.more}>+8</AppText>
  </View>;
}

const styles = StyleSheet.create({
  card: { minHeight: 116, overflow: 'hidden', borderRadius: radius.feature, borderCurve: 'continuous', padding: spacing[5] },
  titleRow: { minHeight: 40, flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  title: { flex: 1, paddingTop: spacing[1] },
  topAction: { marginRight: -spacing[3], marginTop: -spacing[3] },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3], marginTop: spacing[1] },
  code: { flexShrink: 1 },
  room: { maxWidth: '52%', alignItems: 'flex-end' },
  bottomRow: { minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3], marginTop: spacing[3] },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  now: { borderRadius: radius.pill, backgroundColor: colors.brand.coral, paddingHorizontal: spacing[3], paddingVertical: 3 },
  statusConfirmed: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  participants: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 2, borderColor: colors.neutral.surface },
  more: { marginLeft: spacing[2] },
  footer: { marginTop: spacing[3] },
  cancelled: { opacity: 0.72 },
});
