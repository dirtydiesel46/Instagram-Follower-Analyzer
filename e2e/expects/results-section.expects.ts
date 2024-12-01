import { Expect, Page } from '@playwright/test'

export class ResultsSectionExpects {
  constructor(private page: Page, private expect: Expect) {}

  async verifyAnalysisResults() {
    // Verify stats for app data
    await this.expect(this.page.getByTestId('total-followers')).toHaveText('2')
    await this.expect(this.page.getByTestId('total-following')).toHaveText('3')
    await this.expect(this.page.getByTestId('not-following-back')).toHaveText('1')

    // Verify table has correct number of rows
    const rows = await this.page.getByTestId('results-table').locator('tbody tr').count()
    await this.expect(rows).toBe(1)

    // Verify the not following back user
    await this.expect(this.page.getByText('user3')).toBeVisible()
    await this.expect(this.page.getByText('Mar 1, 2024')).toBeVisible()
  }

  async verifyFileUploadResults() {
    // Verify stats for uploaded files
    await this.expect(this.page.getByTestId('total-followers')).toHaveText('3')
    await this.expect(this.page.getByTestId('total-following')).toHaveText('3')
    await this.expect(this.page.getByTestId('not-following-back')).toHaveText('0')

    // Verify table has correct number of rows
    const rows = await this.page.getByTestId('results-table').locator('tbody tr').count()
    await this.expect(rows).toBe(0) // No users not following back
  }
}
