import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalysisResults from './AnalysisResults.vue'
import type { FollowAnalysis } from '@/types/instagram'

describe('AnalysisResults.vue', () => {
  const mockAnalysis: FollowAnalysis = {
    followers: [],
    following: [],
    notFollowingBack: [
      {
        username: 'user1',
        profileUrl: 'https://instagram.com/user1',
        followedAt: new Date('2024-01-01')
      },
      {
        username: 'user2',
        profileUrl: 'https://instagram.com/user2',
        followedAt: new Date('2024-02-01')
      },
      {
        username: 'user3',
        profileUrl: 'https://instagram.com/user3',
        followedAt: new Date('2024-03-01')
      }
    ],
    notFollowedBack: [],
    mutualFollows: []
  }

  it('sorts users by followedAt in ascending order', async () => {
    const wrapper = mount(AnalysisResults, {
      props: {
        analysis: mockAnalysis,
        mode: 'app'
      }
    })

    // Find and click the sort header
    const sortHeader = wrapper.findComponent({ name: 'SortableTableHeader' })
    await sortHeader.trigger('click')

    // Get all dates from the table
    const dates = wrapper.findAll('tbody tr').map(row => row.findAll('td')[1].text())

    // Verify dates are in ascending order
    expect(dates[0]).toContain('Jan')
    expect(dates[1]).toContain('Feb')
    expect(dates[2]).toContain('Mar')
  })

  it('sorts users by followedAt in descending order', async () => {
    const wrapper = mount(AnalysisResults, {
      props: {
        analysis: mockAnalysis,
        mode: 'app'
      }
    })

    // Click twice for descending order
    const sortHeader = wrapper.findComponent({ name: 'SortableTableHeader' })
    await sortHeader.trigger('click')
    await sortHeader.trigger('click')

    const dates = wrapper.findAll('tbody tr').map(row => row.findAll('td')[1].text())

    // Verify dates are in descending order
    expect(dates[0]).toContain('Mar')
    expect(dates[1]).toContain('Feb')
    expect(dates[2]).toContain('Jan')
  })

  it('formats dates correctly', () => {
    const wrapper = mount(AnalysisResults, {
      props: {
        analysis: mockAnalysis,
        mode: 'app'
      }
    })

    const dateCell = wrapper.find('tbody tr td:nth-child(2)')
    expect(dateCell.text()).toMatch(/[A-Z][a-z]{2} \d{1,2}, \d{4}/)
  })
})
