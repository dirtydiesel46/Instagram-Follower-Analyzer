import { Page, Locator } from '@playwright/test'
import * as fs from 'fs'
import { TEXT } from '../constants/text'

export class UploadSectionComponent {
  readonly page: Page
  readonly title: Locator
  readonly instruction: Locator
  readonly followersTitle: Locator
  readonly followersDescription: Locator
  readonly followersFileInput: Locator
  readonly followersUploadStatus: Locator
  readonly followingTitle: Locator
  readonly followingDescription: Locator
  readonly followingFileInput: Locator
  readonly followingUploadStatus: Locator
  readonly analyzeButton: Locator
  readonly analyzeHint: Locator
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { name: TEXT.upload.title })
    this.instruction = page.getByText(TEXT.upload.instruction)
    this.followersTitle = page.getByRole('heading', { name: TEXT.upload.followers.title })
    this.followersDescription = page.getByText(TEXT.upload.followers.description)
    this.followersFileInput = page.getByTestId('followers-file-upload')
    this.followersUploadStatus = page.getByTestId('followers-upload-status')
    this.followingTitle = page.getByRole('heading', { name: TEXT.upload.following.title })
    this.followingDescription = page.getByText(TEXT.upload.following.description)
    this.followingFileInput = page.getByTestId('following-file-upload')
    this.followingUploadStatus = page.getByTestId('following-upload-status')
    this.analyzeButton = page.getByTestId('start-upload-analysis')
    this.analyzeHint = page.getByText(TEXT.upload.analyze.hint)
    this.backButton = page.getByRole('button', { name: '← Back' })
  }

  // Actions
  async uploadFollowersFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    await this.followersFileInput.setInputFiles(filePath)
  }

  async uploadFollowingFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    await this.followingFileInput.setInputFiles(filePath)
  }

  async startAnalysis() {
    await this.analyzeButton.click()
  }

  async goBack() {
    await this.backButton.click()
  }
}
