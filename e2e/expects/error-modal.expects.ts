import { Expect, Page } from '@playwright/test'

export class ErrorModalExpects {
  constructor(private page: Page, private expect: Expect) {}

  async verifyModalClosed() {
    await this.expect(this.page.getByTestId('error-modal')).not.toBeVisible()
  }
}
