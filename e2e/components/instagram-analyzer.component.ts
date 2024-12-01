import { Page, Locator, expect } from '@playwright/test'

export class InstagramAnalyzerComponent {
  readonly page: Page

  // Landing Page elements
  readonly title: Locator
  readonly useAppDataButton: Locator
  readonly useFileUploadButton: Locator
  readonly featureCards: Locator

  // Upload elements
  readonly followersFileInput: Locator
  readonly followingFileInput: Locator
  readonly followersUploadStatus: Locator
  readonly followingUploadStatus: Locator
  readonly analyzeButton: Locator
  readonly backButton: Locator

  // Results elements
  readonly resultsContainer: Locator
  readonly statBoxes: Locator
  readonly notFollowingBackStat: Locator
  readonly newAnalysisButton: Locator
  readonly uploadNewDataButton: Locator

  constructor(page: Page) {
    this.page = page

    // Landing Page
    this.title = page.getByRole('heading', { name: 'Instagram Follower Analyzer' })
    this.useAppDataButton = page.getByTestId('use-app-data')
    this.useFileUploadButton = page.getByTestId('use-file-upload')
    this.featureCards = page.locator('.feature-card')

    // Upload
    this.followersFileInput = page.getByTestId('followers-file-upload')
    this.followingFileInput = page.getByTestId('following-file-upload')
    this.followersUploadStatus = page.getByTestId('followers-upload-status')
    this.followingUploadStatus = page.getByTestId('following-upload-status')
    this.analyzeButton = page.getByTestId('start-upload-analysis')
    this.backButton = page.getByRole('button', { name: '← Back' })

    // Results
    this.resultsContainer = page.locator('.results-container')
    this.statBoxes = page.locator('.stat-box')
    this.notFollowingBackStat = page.locator('.stat-box.highlight')
    this.newAnalysisButton = page.getByRole('button', { name: 'New Analysis' })
    this.uploadNewDataButton = page.getByRole('button', { name: 'Upload New Data' })
  }

  // Navigation actions
  async goto() {
    await this.page.goto('/')
  }

  async goBack() {
    await this.backButton.click()
  }

  // Landing page actions
  async selectAppData() {
    await this.useAppDataButton.click()
  }

  async selectFileUpload() {
    await this.useFileUploadButton.click()
  }

  // File upload actions
  async uploadFollowersFile(filePath: string) {
    await this.followersFileInput.setInputFiles(filePath)
  }

  async uploadFollowingFile(filePath: string) {
    await this.followingFileInput.setInputFiles(filePath)
  }

  async startAnalysis() {
    await this.analyzeButton.click()
  }

  // Verification methods
  async verifyLandingPage() {
    await expect(this.title).toBeVisible()
    await expect(this.featureCards).toHaveCount(4)
    await expect(this.useAppDataButton).toBeVisible()
    await expect(this.useFileUploadButton).toBeVisible()
  }

  async verifyAnalysisResults() {
    await expect(this.resultsContainer).toBeVisible({ timeout: 10000 })
    await expect(this.statBoxes).toContainText('Total Followers2')
    await expect(this.statBoxes).toContainText('Total Following2')
    await expect(this.notFollowingBackStat).toContainText('Not Following Back1')
  }

  async verifyFollowersUploaded() {
    await expect(this.followersUploadStatus).toContainText('✓ Followers file uploaded')
  }

  async verifyFollowingUploaded() {
    await expect(this.followingUploadStatus).toContainText('✓ Following file uploaded')
  }

  async verifyUploadReset() {
    await expect(this.followersUploadStatus).toContainText('Upload followers.json')
    await expect(this.followingUploadStatus).toContainText('Upload following.json')
  }

  async verifyWrongFileError(type: 'followers' | 'following') {
    const message = type === 'followers'
      ? 'This appears to be a following list file'
      : 'This appears to be a followers list file'
    await expect(this.page.getByText(message)).toBeVisible()
  }

  async verifyInvalidFileError() {
    await expect(this.page.getByText('Invalid followers data format')).toBeVisible()
    await expect(this.analyzeButton).toBeDisabled()
  }
}
