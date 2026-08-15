export interface PublicUser {
  id: number
  spotifyId: string
  displayName: string | null
  email: string | null
  country: string | null
  product: string
  avatarUrl: string | null
}

export interface SpotifyLoginData {
  url: string
}
