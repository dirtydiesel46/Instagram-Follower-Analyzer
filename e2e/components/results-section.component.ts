import { Page } from '@playwright/test'

export class ResultsSectionComponent {
  constructor(private page: Page) {}

  async waitForResults() {
    await this.page.waitForSelector('[data-testid="analysis-results"]')
  }

  async getSortedDates() {
    return this.page.$$eval('tbody tr td:nth-child(2)',
      cells => cells.map(cell => cell.textContent || '')
    )
  }

  async clickSortHeader() {
    await this.page.getByTestId('followed-at-header').click()
  }

  async getSortIndicator() {
    const ascending = await this.page.getByText('↑').isVisible()
    const descending = await this.page.getByText('↓').isVisible()
    return ascending ? 'asc' : descending ? 'desc' : null
  }

  async clickNewAnalysis() {
    await this.page.getByRole('button', { name: 'New Analysis' }).click()
  }

  async clickUploadNewData() {
    await this.page.getByRole('button', { name: 'Upload New Data' }).click()
  }

  // Existing methods...
  async getTotalFollowers() {
    return this.page.getByTestId('total-followers').textContent()
  }

  async getTotalFollowing() {
    return this.page.getByTestId('total-following').textContent()
  }

  async getNotFollowingBack() {
    return this.page.getByTestId('not-following-back').textContent()
  }
}
