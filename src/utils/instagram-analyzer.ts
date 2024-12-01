import type { InstagramUser, ComparisonResult } from '../types/instagram'

export class InstagramAnalyzer {
  private followers: Map<string, InstagramUser>
  private following: Map<string, InstagramUser>

  constructor(followersData: InstagramUser[], followingData: InstagramUser[]) {
    this.followers = this.createUserMap(followersData)
    this.following = this.createUserMap(followingData)
  }

  private createUserMap(data: InstagramUser[]): Map<string, InstagramUser> {
    const map = new Map()
    data.forEach((user) => {
      if (user.username) {
        map.set(user.username, user)
      }
    })
    return map
  }

  public getNonFollowingBack(): ComparisonResult[] {
    const results: ComparisonResult[] = []

    this.following.forEach((user, username) => {
      if (!this.followers.has(username)) {
        results.push({
          username: user.username,
          profileUrl: user.profileUrl,
          followedSince: user.followedAt,
        })
      }
    })

    // Sort by most recently followed first
    return results.sort((a, b) => b.followedSince.getTime() - a.followedSince.getTime())
  }
}
