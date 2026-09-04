import { Platform } from 'react-native';

/**
 * Runtime token mirror for designs/design-tokens.json.
 * Components must consume this module rather than introduce screen-local values.
 */
export const colors = {
  brand: {
    ink: '#061430',
    cobalt: '#0559FA',
    cobaltPressed: '#0047D5',
    cobaltSoft: '#E7F0FF',
    coral: '#FF7A4F',
    coralSoft: '#FFE9E1',
    sky: '#D5F2FF',
    skySoft: '#F0FAFF',
  },
  neutral: {
    canvas: '#F7F9FC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F0F4F8',
    textPrimary: '#061430',
    textSecondary: '#4E6078',
    textMuted: '#68788F',
    textDisabled: '#9AA8B8',
    border: '#DDE5EE',
    divider: '#E9EEF4',
    scrim: 'rgba(6, 20, 48, 0.46)',
  },
  semantic: {
    success: { solid: '#168A63', text: '#117A57', soft: '#DDF5EC' },
    warning: { solid: '#F0B44D', text: '#8A5900', soft: '#FFF4CE' },
    danger: { solid: '#CF4038', text: '#A82E2A', soft: '#FFE9E7' },
    neutral: { solid: '#68788F', text: '#4E6078', soft: '#EDF1F5' },
  },
  subject: {
    ocean: { surface: '#BFD5FF', accent: '#0559FA', text: '#061430' },
    aqua: { surface: '#DDF7FA', accent: '#167F96', text: '#061430' },
    lilac: { surface: '#FDF0FF', accent: '#9B4BA4', text: '#061430' },
    sun: { surface: '#FFF3C4', accent: '#8A6400', text: '#061430' },
    mint: { surface: '#DDF5EC', accent: '#117A57', text: '#061430' },
    peach: { surface: '#FFE5D9', accent: '#B95230', text: '#061430' },
  },
} as const;

export const spacing = { 0: 0, 1: 2, 2: 4, 3: 8, 4: 12, 5: 16, 6: 20, 7: 24, 8: 32, 9: 40, 10: 48, 11: 64 } as const;
export const radius = { small: 8, control: 12, card: 16, feature: 20, sheet: 28, pill: 999 } as const;
export const size = { touchTargetMin: 44, control: 52, controlCompact: 40, iconSmall: 16, icon: 20, iconLarge: 24, iconContainer: 40, screenGutter: 20, screenGutterWide: 24, contentMaxWidth: 560, tabBar: 68 } as const;

const fontFaces = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' });
const font = (face: keyof typeof fontFaces) => ({ fontFamily: fontFaces[face] || systemFont });

export const type = {
  display: { ...font('extrabold'), fontSize: 40, lineHeight: 44, letterSpacing: -1.2 },
  heading1: { ...font('extrabold'), fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  heading2: { ...font('bold'), fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  heading3: { ...font('bold'), fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  title: { ...font('bold'), fontSize: 17, lineHeight: 23, letterSpacing: 0 },
  body: { ...font('regular'), fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  bodySmall: { ...font('regular'), fontSize: 13, lineHeight: 19, letterSpacing: 0 },
  label: { ...font('semibold'), fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  caption: { ...font('medium'), fontSize: 11, lineHeight: 15, letterSpacing: 0.1 },
} as const;

export type TypeVariant = keyof typeof type;
export type SubjectTone = keyof typeof colors.subject;
export type SemanticTone = keyof typeof colors.semantic;

export const shadow = {
  floating: {
    shadowColor: colors.brand.ink,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

export const motion = { instant: 100, quick: 160, standard: 220, emphasized: 320, pressedScale: 0.98 } as const;
