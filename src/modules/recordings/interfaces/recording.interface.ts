export interface RecordingItem {
  id: number
  title: string | null
  durationMs: number
  createdAt: string
}

export interface RecordingTrackGroup {
  spotifyId: string
  title: string
  artistName: string
  imageUrl: string | null
  recordings: RecordingItem[]
}
