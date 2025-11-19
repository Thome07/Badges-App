export interface User {
  id: string
  email: string
  name: string | null
  bio: string | null
  avatar_url: string | null
  role: 'student' | 'admin'
  created_at: string
}

export interface Badge {
  id: string
  title: string
  description: string
  image_url: string
  created_at: string
}

export interface UserBadge {
  id: string
  user: User
  badge: Badge
  created_at: string
}