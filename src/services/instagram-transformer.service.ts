import type {
  InstagramRawListItem,
  InstagramUser,
  InstagramRawFollowers,
  InstagramRawFollowing
} from '@/types/instagram'

export class InstagramTransformerService {
  private static transformListItem(item: InstagramRawListItem): InstagramUser {
    return {
      username: item.string_list_data[0].value,
      profileUrl: item.string_list_data[0].href,
      followedAt: new Date(item.string_list_data[0].timestamp * 1000)
    }
  }

  static transformFollowers(data: InstagramRawListItem[] | InstagramRawFollowers): InstagramUser[] {
    if (Array.isArray(data)) {
      return data.map(this.transformListItem)
    }

    if ('relationships_followers' in data) {
      return data.relationships_followers.map(this.transformListItem)
    }

    throw new Error(`Invalid followers data format: ${JSON.stringify(data)}`)
  }

  static transformFollowing(data: InstagramRawFollowing | InstagramRawListItem[]): InstagramUser[] {
    if (Array.isArray(data)) {
      return data.map(this.transformListItem)
    }

    if (data && 'relationships_following' in data) {
      return data.relationships_following.map(this.transformListItem)
    }

    throw new Error(`Invalid following data format: ${JSON.stringify(data)}`)
  }
}
