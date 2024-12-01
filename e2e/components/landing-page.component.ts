import { Page, Locator } from '@playwright/test'
import { TEXT } from '../constants/text'

export class LandingPageComponent {
  readonly page: Page
  readonly title: Locator
  readonly subtitle: Locator
  readonly featureCards: Locator
  readonly dataSourceTitle: Locator
  readonly useAppDataButton: Locator
  readonly useFileUploadButton: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { name: TEXT.landing.title })
    this.subtitle = page.getByText(TEXT.landing.subtitle)
    this.featureCards = page.locator('.feature-card')
    this.dataSourceTitle = page.getByRole('heading', { name: TEXT.landing.dataSource.title })
    this.useAppDataButton = page.getByTestId('use-app-data')
    this.useFileUploadButton = page.getByTestId('use-file-upload')
  }

  async goto() {
    await this.page.goto('/')
  }

  async selectAppData() {
    await this.useAppDataButton.click()
  }

  async selectFileUpload() {
    await this.useFileUploadButton.click()
  }
}
