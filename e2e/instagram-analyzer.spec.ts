/* eslint-disable playwright/expect-expect */
import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import { InstagramAnalyzerPage } from './pages/instagram-analyzer.page'
import { TEXT } from './constants/text'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test.describe('Instagram Analyzer', () => {
  let page: InstagramAnalyzerPage

  test.beforeEach(async ({ page: p }) => {
    page = new InstagramAnalyzerPage(p)
    await page.landing.goto()
  })

  test.describe('Landing Page', () => {
    test('should show initial landing page with all features', async ({ page }) => {
      await test.step('Verify header content', async () => {
        await expect(page.getByRole('heading', { name: TEXT.landing.title })).toBeVisible()
        await expect(page.getByText(TEXT.landing.subtitle)).toBeVisible()
      })

      await test.step('Verify all feature cards', async () => {
        for (const feature of TEXT.landing.features) {
          await expect(page.getByRole('heading', { name: feature.title })).toBeVisible()
          await expect(page.getByText(feature.description)).toBeVisible()
        }
      })

      await test.step('Verify data source section', async () => {
        await expect(
          page.getByRole('heading', { name: TEXT.landing.dataSource.title }),
        ).toBeVisible()

        // App data option
        const appButton = page.getByTestId('use-app-data')
        await expect(appButton).toBeVisible()
        await expect(appButton).toContainText(TEXT.landing.dataSource.app.title)
        await expect(appButton).toContainText(TEXT.landing.dataSource.app.description)
        await expect(appButton).toContainText(TEXT.landing.dataSource.app.badge)

        // Upload data option
        const uploadButton = page.getByTestId('use-file-upload')
        await expect(uploadButton).toBeVisible()
        await expect(uploadButton).toContainText(TEXT.landing.dataSource.upload.title)
        await expect(uploadButton).toContainText(TEXT.landing.dataSource.upload.description)
        await expect(uploadButton).toContainText(TEXT.landing.dataSource.upload.badge)
      })
    })

    test('should handle app data button interaction and view change', async ({ page }) => {
      const appButton = page.getByTestId('use-app-data')
      await appButton.hover()
      await expect(appButton).toHaveClass('source-button')
      await appButton.click()
      // Wait for loading to complete and verify final state
      await expect(page.getByTestId('app-analysis-view')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'App Data Analysis' })).toBeVisible()
    })

    test('should handle upload button interaction and view change', async ({ page }) => {
      const uploadButton = page.getByTestId('use-file-upload')
      await uploadButton.hover()
      await expect(uploadButton).toHaveClass('source-button')
      await uploadButton.click()

      // Verify view change
      await expect(page.getByTestId('use-file-upload')).toBeHidden()
      await expect(page.getByRole('heading', { name: 'Upload Instagram Data' })).toBeVisible()
      await expect(page.getByText('Please upload your Instagram data files')).toBeVisible()
    })
  })

  test.describe('App Data Analysis', () => {
    test('should analyze app data automatically', async () => {
      await page.landing.selectAppData()
      await page.resultsExpects.verifyAnalysisResults()
    })

    test('should handle new analysis request', async () => {
      await page.landing.selectAppData()
      await page.resultsExpects.verifyAnalysisResults()
      await page.results.clickNewAnalysis()
      await page.resultsExpects.verifyAnalysisResults()
    })
  })

  test.describe('File Upload Analysis', () => {
    const getFixturePath = (filename: string) => {
      const filePath = path.join(__dirname, 'fixtures', 'instagram-data', filename)
      return filePath
    }

    test('should handle valid file uploads', async () => {
      await test.step('Navigate to upload mode', async () => {
        await page.landing.selectFileUpload()
      })

      await test.step('Upload followers file', async () => {
        const followersPath = getFixturePath('followers.json')
        await page.upload.uploadFollowersFile(followersPath)
        await page.uploadExpects.verifyFollowersUploaded()
      })

      await test.step('Upload following file', async () => {
        const followingPath = getFixturePath('following.json')
        await page.upload.uploadFollowingFile(followingPath)
        await page.uploadExpects.verifyFollowingUploaded()
      })

      await test.step('Start analysis', async () => {
        await page.upload.startAnalysis()
        await page.resultsExpects.verifyFileUploadResults()
      })
    })

    test('should prevent wrong file type uploads', async () => {
      await test.step('Navigate to upload mode', async () => {
        await page.landing.selectFileUpload()
      })

      await test.step('Try uploading following file to followers input', async () => {
        await page.upload.uploadFollowersFile(getFixturePath('following.json'))
        await page.uploadExpects.verifyWrongFileError('followers')
        await page.errorModal.closeModal()
        await page.errorModalExpects.verifyModalClosed()
      })

      await test.step('Try uploading followers file to following input', async () => {
        await page.upload.uploadFollowingFile(getFixturePath('followers.json'))
        await page.uploadExpects.verifyWrongFileError('following')
        await page.errorModal.closeModal()
        await page.errorModalExpects.verifyModalClosed()
      })
    })

    test('should handle invalid file formats', async () => {
      await test.step('Navigate to upload mode', async () => {
        await page.landing.selectFileUpload()
      })

      await test.step('Try uploading invalid JSON file to followers input', async () => {
        await page.upload.uploadFollowersFile(getFixturePath('invalid.json'))
        await page.uploadExpects.verifyInvalidFileError('invalid')
        await page.errorModal.closeModal()
        await page.errorModalExpects.verifyModalClosed()
      })

      await test.step('Try uploading invalid JSON file to following input', async () => {
        await page.upload.uploadFollowingFile(getFixturePath('invalid.json'))
        await page.uploadExpects.verifyInvalidFileError('invalid')
        await page.errorModal.closeModal()
        await page.errorModalExpects.verifyModalClosed()
      })
    })

    test('should handle modal interactions', async () => {
      await test.step('Close modal by clicking OK button', async () => {
        await page.landing.selectFileUpload()
        await page.upload.uploadFollowersFile(getFixturePath('invalid.json'))
        await page.errorModal.closeModal()
        await page.errorModalExpects.verifyModalClosed()
      })

      await test.step('Close modal by clicking outside', async () => {
        await page.upload.uploadFollowersFile(getFixturePath('invalid.json'))
        await page.errorModal.closeByClickingOutside()
        await page.errorModalExpects.verifyModalClosed()
      })
    })

    test('should reset state when switching modes', async () => {
      await page.landing.selectFileUpload()
      await page.upload.uploadFollowersFile(getFixturePath('followers.json'))
      await page.uploadExpects.verifyFollowersUploaded()

      await page.upload.goBack()
      await page.landing.selectFileUpload()
      await page.uploadExpects.verifyUploadReset()
    })

    test('should handle new upload request after analysis', async () => {
      await page.landing.selectFileUpload()

      // Complete initial analysis
      await page.upload.uploadFollowersFile(getFixturePath('followers.json'))
      await page.upload.uploadFollowingFile(getFixturePath('following.json'))
      await page.upload.startAnalysis()
      await page.resultsExpects.verifyFileUploadResults()

      // Request new upload
      await page.results.clickUploadNewData()
      await page.uploadExpects.verifyUploadReset()
    })
  })

  test.describe('Sorting Functionality', () => {
    test('should sort followers by date', async () => {
      await page.landing.selectAppData()
      await page.results.waitForResults()

      // Sort ascending
      await page.results.clickSortHeader()
      const ascendingDates = await page.results.getSortedDates()

      // Verify ascending order
      for (let i = 1; i < ascendingDates.length; i++) {
        const prevDate = new Date(ascendingDates[i - 1])
        const currDate = new Date(ascendingDates[i])
        expect(prevDate <= currDate).toBeTruthy()
      }

      // Sort descending
      await page.results.clickSortHeader()
      const descendingDates = await page.results.getSortedDates()

      // Verify descending order
      for (let i = 1; i < descendingDates.length; i++) {
        const prevDate = new Date(descendingDates[i - 1])
        const currDate = new Date(descendingDates[i])
        expect(prevDate >= currDate).toBeTruthy()
      }
    })

    test('should show sort indicators', async () => {
      await page.landing.selectAppData()
      await page.results.waitForResults()

      // Initially no sort indicator
      expect(await page.results.getSortIndicator()).toBeNull()

      // Click for ascending sort
      await page.results.clickSortHeader()
      expect(await page.results.getSortIndicator()).toBe('asc')

      // Click for descending sort
      await page.results.clickSortHeader()
      expect(await page.results.getSortIndicator()).toBe('desc')
    })
  })
})
