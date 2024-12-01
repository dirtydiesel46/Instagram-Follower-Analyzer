import { Page, Locator } from '@playwright/test'

export class ErrorModalComponent {
  readonly page: Page
  readonly modal: Locator
  readonly okButton: Locator
  readonly overlay: Locator

  constructor(page: Page) {
    this.page = page
    this.modal = page.getByTestId('error-modal')
    this.okButton = page.getByTestId('modal-close-button')
    this.overlay = page.getByTestId('modal-overlay')
  }

  async closeModal() {
    await this.okButton.click()
  }

  async closeByClickingOutside() {
    await this.overlay.click({ position: { x: 10, y: 10 } })
  }
}
