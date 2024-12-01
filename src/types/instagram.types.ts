export interface InstagramRawStringListData {
  href: string
  value: string
  timestamp: number
}

export interface InstagramRawListItem {
  title: string
  media_list_data: unknown[]
  string_list_data: InstagramRawStringListData[]
}

export interface InstagramRawFollowing {
  relationships_following: InstagramRawListItem[]
}

export interface InstagramUser {
  username: string
  profileUrl: string
  followedAt: string
}

export interface InstagramData {
  followers: InstagramUser[]
  following: InstagramUser[]
}

export interface FollowAnalysis {
  notFollowingBack: InstagramUser[]
  followers: InstagramUser[]
  following: InstagramUser[]
  notFollowedBack: InstagramUser[]
  mutualFollows: InstagramUser[]
}
