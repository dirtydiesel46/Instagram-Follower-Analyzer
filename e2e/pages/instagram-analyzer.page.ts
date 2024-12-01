import { Page, expect } from '@playwright/test'
import { LandingPageComponent } from '../components/landing-page.component'
import { UploadSectionComponent } from '../components/upload-section.component'
import { ResultsSectionComponent } from '../components/results-section.component'
import { ErrorModalComponent } from '../components/error-modal.component'
import { ResultsSectionExpects } from '../expects/results-section.expects'
import { UploadSectionExpects } from '../expects/upload-section.expects'
import { ErrorModalExpects } from '../expects/error-modal.expects'

export class InstagramAnalyzerPage {
  readonly landing: LandingPageComponent
  readonly upload: UploadSectionComponent
  readonly results: ResultsSectionComponent
  readonly errorModal: ErrorModalComponent
  readonly resultsExpects: ResultsSectionExpects
  readonly uploadExpects: UploadSectionExpects
  readonly errorModalExpects: ErrorModalExpects

  constructor(private page: Page) {
    this.landing = new LandingPageComponent(page)
    this.upload = new UploadSectionComponent(page)
    this.results = new ResultsSectionComponent(page)
    this.errorModal = new ErrorModalComponent(page)
    this.resultsExpects = new ResultsSectionExpects(page, expect)
    this.uploadExpects = new UploadSectionExpects(page, expect)
    this.errorModalExpects = new ErrorModalExpects(page, expect)
  }
}
