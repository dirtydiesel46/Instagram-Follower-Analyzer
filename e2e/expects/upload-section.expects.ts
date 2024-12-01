import { Expect, Page } from '@playwright/test'
import { TEXT } from '../constants/text'

export class UploadSectionExpects {
  constructor(private page: Page, private expect: Expect) {}

  async verifyFollowersUploaded() {
    await this.expect(
      this.page.getByTestId('followers-upload-status')
    ).toContainText(TEXT.upload.followers.success)
  }

  async verifyFollowingUploaded() {
    await this.expect(
      this.page.getByTestId('following-upload-status')
    ).toContainText(TEXT.upload.following.success)
  }

  async verifyUploadReset() {
    await this.expect(
      this.page.getByTestId('followers-upload-status')
    ).toContainText('Upload followers.json')
    await this.expect(
      this.page.getByTestId('following-upload-status')
    ).toContainText('Upload following.json')
  }

  async verifyWrongFileError(type: 'followers' | 'following') {
    const message =
      type === 'followers' ? TEXT.errors.wrongFile.followers : TEXT.errors.wrongFile.following
    await this.expect(this.page.getByRole('heading', { name: 'Wrong File Type' })).toBeVisible()
    await this.expect(this.page.getByText(message)).toBeVisible()
  }

  async verifyInvalidFileError(type: 'followers' | 'following' | 'invalid') {
    await this.expect(this.page.getByRole('heading', { name: 'Invalid File Format' })).toBeVisible()
    const message = type === 'invalid'
      ? TEXT.errors.invalidFile
      : type === 'following'
        ? TEXT.errors.invalidFollowingModal
        : TEXT.errors.invalidFile
    await this.expect(this.page.getByText(message)).toBeVisible()
    await this.expect(
      this.page.getByTestId('start-upload-analysis')
    ).toBeDisabled()
  }
}
