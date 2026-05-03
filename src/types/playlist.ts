export interface PlaylistItem {
  id: string
  name: string
  url: string
  group: string
  logo?: string
}

export interface Playlist {
  id: string
  name: string
  items: PlaylistItem[]
  createdAt: string
}
