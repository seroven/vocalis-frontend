import { apiGet, apiPost } from '../../../config/api'
import type { PublicUser, SpotifyLoginData } from '../interfaces/auth.interface'

export class AuthService {
  static getSpotifyLogin() {
    return apiGet<SpotifyLoginData>('/auth/spotify')
  }

  static completeSpotifyLogin(code: string, state: string) {
    return apiPost<PublicUser>('/auth/spotify/callback', { code, state })
  }

  static me() {
    return apiGet<PublicUser>('/auth/me')
  }

  static logout() {
    return apiPost<{ loggedOut: boolean }>('/auth/logout')
  }
}
