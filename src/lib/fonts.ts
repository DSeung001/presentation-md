export type FontPreset = 'default' | 'serif' | 'mono' | 'display' | 'gothic'

export type FontStacks = {
  body: string
  heading: string
}

export type FontPresetDef = {
  id: FontPreset
  label: string
  ko: FontStacks
  en: FontStacks
}

export type DocFonts = {
  fontKo: FontPreset
  fontEn: FontPreset
}

const FONT_PRESET_IDS = new Set<FontPreset>([
  'default',
  'serif',
  'mono',
  'display',
  'gothic',
])

export const FONT_PRESETS: FontPresetDef[] = [
  {
    id: 'default',
    label: 'Default',
    ko: {
      body: '"Noto Sans KR", sans-serif',
      heading: '"Fraunces", Georgia, serif',
    },
    en: {
      body: '"Noto Sans", sans-serif',
      heading: '"Fraunces", Georgia, serif',
    },
  },
  {
    id: 'serif',
    label: 'Serif',
    ko: {
      body: '"Noto Serif KR", serif',
      heading: '"Noto Serif KR", serif',
    },
    en: {
      body: '"Source Serif 4", Georgia, serif',
      heading: '"Source Serif 4", Georgia, serif',
    },
  },
  {
    id: 'mono',
    label: 'Mono',
    ko: {
      body: '"JetBrains Mono", ui-monospace, monospace',
      heading: '"JetBrains Mono", ui-monospace, monospace',
    },
    en: {
      body: '"JetBrains Mono", ui-monospace, monospace',
      heading: '"JetBrains Mono", ui-monospace, monospace',
    },
  },
  {
    id: 'display',
    label: 'Display',
    ko: {
      body: '"Noto Sans KR", sans-serif',
      heading: '"Black Han Sans", sans-serif',
    },
    en: {
      body: '"Noto Sans", sans-serif',
      heading: '"Oswald", sans-serif',
    },
  },
  {
    id: 'gothic',
    label: 'Gothic',
    ko: {
      body: '"Gowun Dodum", sans-serif',
      heading: '"Gowun Batang", serif',
    },
    en: {
      body: '"Inter", sans-serif',
      heading: '"Merriweather", Georgia, serif',
    },
  },
]

const PRESET_MAP = new Map(FONT_PRESETS.map((p) => [p.id, p]))

export function parseFontPreset(value: string | undefined): FontPreset {
  const font = value?.trim().toLowerCase()
  if (font && FONT_PRESET_IDS.has(font as FontPreset)) {
    return font as FontPreset
  }
  return 'default'
}

export function resolveDocFonts(data: Record<string, string>): DocFonts {
  const base = parseFontPreset(data.font)
  return {
    fontKo: data.fontKo ? parseFontPreset(data.fontKo) : base,
    fontEn: data.fontEn ? parseFontPreset(data.fontEn) : base,
  }
}

export function getPreset(id: FontPreset): FontPresetDef {
  return PRESET_MAP.get(id) ?? PRESET_MAP.get('default')!
}

export function getDocFontStacks(fonts: DocFonts): {
  ko: FontStacks
  en: FontStacks
} {
  return {
    ko: getPreset(fonts.fontKo).ko,
    en: getPreset(fonts.fontEn).en,
  }
}

export function fontStacksToStyle(
  stacks: { ko: FontStacks; en: FontStacks },
): Record<string, string> {
  return {
    '--font-ko-body': stacks.ko.body,
    '--font-ko-heading': stacks.ko.heading,
    '--font-en-body': stacks.en.body,
    '--font-en-heading': stacks.en.heading,
  }
}
