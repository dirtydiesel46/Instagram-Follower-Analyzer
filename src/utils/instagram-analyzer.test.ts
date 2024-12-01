import { describe, it, expect } from 'vitest'
import { InstagramService } from '@/services/instagram.service'
import { InstagramTransformerService } from '@/services/instagram-transformer.service'
import type { InstagramRawListItem } from '@/types/instagram'
import mockFollowers from '../../tests/fixtures/data/followers.json'
import mockFollowing from '../../tests/fixtures/data/following.json'

describe('Instagram Analyzer', () => {
  it('should correctly identify users not following back', async () => {
    const mockData = {
      followers: InstagramTransformerService.transformFollowers(
        mockFollowers as InstagramRawListItem[],
      ),
      following: InstagramTransformerService.transformFollowing(
        mockFollowing.relationships_following as InstagramRawListItem[],
      ),
    }

    const service = new InstagramService(mockData)
    const analysis = await service.analyzeFollowers()

    expect(analysis.notFollowingBack).toHaveLength(1)
    expect(analysis.notFollowingBack[0].username).toBe('example_user3')
  })

  it('should correctly transform Instagram data format', () => {
    const mockFollowersData: InstagramRawListItem[] = [
      {
        string_list_data: [
          {
            value: 'example_user3',
            href: 'https://instagram.com/testuser',
            timestamp: 1234567890,
          },
        ],
      },
    ]

    const transformed = InstagramTransformerService.transformFollowers(mockFollowersData)

    expect(transformed[0]).toEqual({
      username: 'example_user3',
      profileUrl: 'https://instagram.com/testuser',
      followedAt: expect.any(Date),
    })
  })
})
