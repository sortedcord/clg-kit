import { Platform } from 'react-native';

const cobalt = '#0559FA';
const ink = '#061430';
const canvas = '#F7F9FC';
const muted = '#68788F';

/** Legacy-compatible theme exports backed by the CLG Kit light design system. */
export const Colors = {
  light: {
    text: ink,
    background: canvas,
    tint: cobalt,
    icon: muted,
    tabIconDefault: muted,
    tabIconSelected: cobalt,
  },
  dark: {
    text: ink,
    background: canvas,
    tint: cobalt,
    icon: muted,
    tabIconDefault: muted,
    tabIconSelected: cobalt,
  },
};

export const Fonts = Platform.select({
  ios: { sans: 'Manrope_400Regular', serif: 'ui-serif', rounded: 'Manrope_600SemiBold', mono: 'ui-monospace' },
  android: { sans: 'Manrope_400Regular', serif: 'serif', rounded: 'Manrope_600SemiBold', mono: 'monospace' },
  default: { sans: 'Manrope_400Regular', serif: 'serif', rounded: 'Manrope_600SemiBold', mono: 'monospace' },
  web: { sans: "Manrope_400Regular, system-ui, sans-serif", serif: "Georgia, 'Times New Roman', serif", rounded: "Manrope_600SemiBold, system-ui, sans-serif", mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
});
