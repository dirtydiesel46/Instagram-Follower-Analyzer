export interface InstagramRawListItem {
  string_list_data: Array<{
    value: string
    href: string
    timestamp: number
  }>
}

export interface InstagramRawFollowers {
  relationships_followers: InstagramRawListItem[]
}

export interface InstagramRawFollowing {
  relationships_following: InstagramRawListItem[]
}

export interface InstagramUser {
  username: string
  profileUrl: string
  followedAt: Date
}

export interface InstagramData {
  followers: InstagramUser[]
  following: InstagramUser[]
}

export interface ComparisonResult {
  username: string
  profileUrl: string
  followedSince: Date
}

export interface FollowAnalysis {
  followers: InstagramUser[]
  following: InstagramUser[]
  notFollowingBack: InstagramUser[]
  notFollowedBack: InstagramUser[]
  mutualFollows: InstagramUser[]
}

export interface AnalysisResult {
  followers: InstagramUser[]
  following: InstagramUser[]
  analysis: FollowAnalysis
}

export type ParsedUser = {
  username: string
  profileUrl: string
  followedAt?: Date
}
