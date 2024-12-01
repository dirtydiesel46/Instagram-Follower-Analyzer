import type {
  InstagramData,
  InstagramUser,
  FollowAnalysis,
  InstagramRawListItem,
  InstagramRawFollowing
} from '@/types/instagram'

export class InstagramService {
  private data: InstagramData

  constructor(data: InstagramData) {
    this.data = data
  }

  async analyzeFollowers(): Promise<FollowAnalysis> {
    const { followers, following } = this.data

    const notFollowingBack = following.filter(
      (followingUser: InstagramUser) =>
        !followers.some((follower: InstagramUser) => follower.username === followingUser.username),
    )

    return {
      notFollowingBack,
      notFollowedBack: [],
      mutualFollows: [],
      followers,
      following,
    }
  }
}
