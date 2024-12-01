import { expect } from '@playwright/test'
import { LandingPageComponent } from '../components/landing-page.component'

export class LandingPageExpects {
  constructor(private component: LandingPageComponent) {}

  async verifyLandingPage() {
    await expect(this.component.title).toBeVisible()
    await expect(this.component.featureCards).toHaveCount(4)
    await expect(this.component.useAppDataButton).toBeVisible()
    await expect(this.component.useFileUploadButton).toBeVisible()
  }
}
