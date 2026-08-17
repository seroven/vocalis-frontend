export const TAG_COLORS = [
  'accent',
  'rose',
  'amber',
  'lime',
  'sky',
  'violet',
  'coral',
  'mint',
] as const

export const TAG_SHAPES = [
  'mark',
  'pill',
  'underline',
  'wave',
  'outline',
  'slash',
] as const

export const TAG_SCOPES = ['general', 'artist', 'album', 'track'] as const

export type TagColor = (typeof TAG_COLORS)[number]
export type TagShape = (typeof TAG_SHAPES)[number]
export type TagScope = (typeof TAG_SCOPES)[number]

export interface Tag {
  id: number
  name: string
  color: TagColor
  shape: TagShape
  scope: TagScope
  targetId: string | null
  targetName: string | null
}

export type TagTarget = {
  id: string
  name: string
  scope: Exclude<TagScope, 'general'>
}

export interface LyricTagMark {
  id: number
  tagId: number
  spotifyId: string
  lineIndex: number
  startOffset: number
  endOffset: number
  excerpt: string
  tag: Tag
}

export const TAG_COLOR_CSS: Record<TagColor, string> = {
  accent: 'var(--app-accent)',
  rose: 'hsl(350 72% 58%)',
  amber: 'hsl(38 88% 52%)',
  lime: 'hsl(88 62% 44%)',
  sky: 'hsl(198 78% 48%)',
  violet: 'hsl(268 62% 62%)',
  coral: 'hsl(12 82% 58%)',
  mint: 'hsl(162 52% 42%)',
}

export const TAG_COLOR_LABELS: Record<TagColor, string> = {
  accent: 'Acento',
  rose: 'Rosa',
  amber: 'Ámbar',
  lime: 'Lima',
  sky: 'Cielo',
  violet: 'Violeta',
  coral: 'Coral',
  mint: 'Menta',
}

export const TAG_SHAPE_LABELS: Record<TagShape, string> = {
  mark: 'Marcador',
  pill: 'Pastilla',
  underline: 'Subrayado',
  wave: 'Onda',
  outline: 'Contorno',
  slash: 'Rayado',
}

export const TAG_SCOPE_LABELS: Record<TagScope, string> = {
  general: 'General',
  artist: 'Artista',
  album: 'Álbum',
  track: 'Canción',
}
