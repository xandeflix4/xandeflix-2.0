export interface Profile {
  id: string
  name: string
  avatarUrl: string
  isChild: boolean
}

export interface User {
  id: string
  email: string
  profiles: Profile[]
}
