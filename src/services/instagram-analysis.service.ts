import type { InstagramData, FollowAnalysis } from '@/types/instagram'

export class InstagramAnalysisService {
  constructor(private data: InstagramData) {}

  async analyzeFollowers(): Promise<FollowAnalysis> {
    const { followers, following } = this.data

    // Create sets for efficient lookup
    const followerUsernames = new Set(followers.map(f => f.username))
    const followingUsernames = new Set(following.map(f => f.username))

    // Find users not following back
    const notFollowingBack = following.filter(user => !followerUsernames.has(user.username))

    // Find users not followed back
    const notFollowedBack = followers.filter(user => !followingUsernames.has(user.username))

    // Find mutual follows
    const mutualFollows = following.filter(user => followerUsernames.has(user.username))

    console.log('Analysis details:', {
      followerUsernames: Array.from(followerUsernames),
      followingUsernames: Array.from(followingUsernames),
      notFollowingBack: notFollowingBack.map(u => u.username),
      notFollowedBack: notFollowedBack.map(u => u.username),
      mutualFollows: mutualFollows.map(u => u.username)
    })

    return {
      followers,
      following,
      notFollowingBack,
      notFollowedBack,
      mutualFollows
    }
  }
}
