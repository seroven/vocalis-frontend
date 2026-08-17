import type { LyricTagMark } from '../interfaces/tag.interface'

export type LyricSegment = {
  text: string
  marks: LyricTagMark[]
}

export function lyricSegments(text: string, marks: LyricTagMark[]): LyricSegment[] {
  const points = new Set([0, text.length])

  for (const mark of marks) {
    points.add(Math.max(0, Math.min(text.length, mark.startOffset)))
    points.add(Math.max(0, Math.min(text.length, mark.endOffset)))
  }

  const sorted = [...points].sort((left, right) => left - right)
  const segments: LyricSegment[] = []

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const start = sorted[index]
    const end = sorted[index + 1]
    if (end <= start) {
      continue
    }

    segments.push({
      text: text.slice(start, end),
      marks: marks.filter((mark) => mark.startOffset < end && mark.endOffset > start),
    })
  }

  return segments.length > 0 ? segments : [{ text, marks: [] }]
}
