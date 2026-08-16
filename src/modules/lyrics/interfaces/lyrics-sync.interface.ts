export interface LyricLine {
  text: string
  startMs: number | null
  endMs: number | null
}

export interface LyricSyncData {
  source: 'global' | 'user' | null
  complete: boolean
  lines: LyricLine[]
}

export function isSyncComplete(lines: LyricLine[]) {
  return (
    lines.length > 0 &&
    lines.every(
      (line) =>
        line.startMs != null &&
        line.endMs != null &&
        line.endMs > line.startMs,
    )
  )
}

export function splitLyricLines(lyrics: string) {
  return lyrics
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ text, startMs: null, endMs: null }) satisfies LyricLine)
}

export function singingIndex(lines: LyricLine[]) {
  return lines.findIndex((line) => line.startMs != null && line.endMs == null)
}

export function nextLineIndex(lines: LyricLine[]) {
  return lines.findIndex((line) => line.startMs == null)
}

export function activeLineIndex(lines: LyricLine[], position: number) {
  return lines.findIndex(
    (line) =>
      line.startMs != null &&
      line.endMs != null &&
      position >= line.startMs &&
      position < line.endMs,
  )
}

export const INSTRUMENTAL_GAP_MS = 120

export type LyricCue =
  | { kind: 'line'; index: number }
  | { kind: 'gap'; id: string; afterIndex: number }

export function isInstrumentalGap(
  endMs: number | null,
  startMs: number | null,
) {
  return endMs != null && startMs != null && startMs - endMs > INSTRUMENTAL_GAP_MS
}

export function buildLyricCues(lines: LyricLine[]): LyricCue[] {
  const cues: LyricCue[] = []

  for (let index = 0; index < lines.length; index += 1) {
    cues.push({ kind: 'line', index })

    const current = lines[index]
    const next = lines[index + 1]
    if (isInstrumentalGap(current?.endMs ?? null, next?.startMs ?? null)) {
      cues.push({ kind: 'gap', id: `gap-${index}`, afterIndex: index })
    }
  }

  return cues
}

export function activeLyricCue(
  lines: LyricLine[],
  position: number,
): LyricCue | null {
  const lineIndex = activeLineIndex(lines, position)
  if (lineIndex >= 0) {
    return { kind: 'line', index: lineIndex }
  }

  for (let index = 0; index < lines.length - 1; index += 1) {
    const current = lines[index]
    const next = lines[index + 1]
    if (
      isInstrumentalGap(current.endMs, next.startMs) &&
      current.endMs != null &&
      next.startMs != null &&
      position >= current.endMs &&
      position < next.startMs
    ) {
      return { kind: 'gap', id: `gap-${index}`, afterIndex: index }
    }
  }

  return null
}

export function isPastLyricLine(
  index: number,
  lines: LyricLine[],
  position: number,
  active: LyricCue | null,
) {
  if (active?.kind === 'line') {
    return index < active.index
  }

  if (active?.kind === 'gap') {
    return index <= active.afterIndex
  }

  const ended = lines.findLastIndex(
    (line) => line.endMs != null && position >= line.endMs,
  )
  return ended >= 0 && index <= ended
}
