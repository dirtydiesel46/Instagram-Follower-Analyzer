<template>
  <div class="instagram-analyzer">
    <!-- Step 1: Choose Data Source -->
    <div
      v-if="currentStep === 'choose-source'"
      class="landing-container"
      data-testid="landing-view"
    >
      <div class="landing-header">
        <h1>Instagram Analyzer</h1>
        <p class="subtitle">Analyze your Instagram followers and following</p>
      </div>

      <div class="features-grid">
        <div v-for="(feature, key) in features" :key="key" class="feature-card">
          <span class="feature-icon">{{ feature.icon }}</span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>

      <div class="source-selection">
        <h2>Choose Your Data Source</h2>
        <div class="source-options">
          <button class="source-button" @click="selectDataSource('app')" data-testid="use-app-data">
            <span class="source-icon">📱</span>
            <div class="source-content">
              <h3>Use App Data</h3>
              <p>Quick analysis using sample data</p>
              <span class="source-badge">Instant Results</span>
            </div>
          </button>
          <button
            class="source-button"
            @click="selectDataSource('upload')"
            data-testid="use-file-upload"
          >
            <span class="source-icon">📤</span>
            <div class="source-content">
              <h3>Upload Instagram Data</h3>
              <p>Analyze your own Instagram data</p>
              <span class="source-badge">Custom Analysis</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: App Data Analysis -->
    <div
      v-else-if="currentStep === 'app-analysis'"
      class="step-container"
      data-testid="app-analysis-view"
    >
      <div class="step-header">
        <button class="back-button" @click="goBack">← Back</button>
        <h2>App Data Analysis</h2>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">⏳</div>
        <p>Analyzing data...</p>
      </div>

      <AnalysisResults
        v-else-if="analysis"
        :analysis="analysis"
        :mode="dataSource"
        @reset="resetAnalysis"
        @download="downloadJson"
        @copy-url="copyProfileUrl"
      />
    </div>

    <!-- Step 3: Upload Data Analysis -->
    <div
      v-else-if="currentStep === 'upload-analysis'"
      class="step-container"
      data-testid="upload-analysis-view"
    >
      <div class="step-header">
        <button class="back-button" @click="goBack">← Back</button>
        <h2>Upload Instagram Data</h2>
      </div>

      <div class="upload-container" v-if="!dataLoaded">
        <p class="upload-instructions">
          Please upload your Instagram data files. You can find these files in your Instagram data
          export.
        </p>

        <div class="file-upload-grid">
          <div class="file-upload-box">
            <div class="upload-icon">📥</div>
            <h4>Followers Data</h4>
            <p class="upload-description">
              Upload the file containing your Instagram followers list
            </p>
            <input
              type="file"
              @change="handleFollowersUpload"
              accept=".json"
              data-testid="followers-file-upload"
              :key="'followers-' + uploadKey"
              class="file-input"
            />
            <p class="upload-status" data-testid="followers-upload-status">
              {{ followersFile ? '✓ Followers file uploaded' : 'Upload followers.json' }}
            </p>
          </div>

          <div class="file-upload-box">
            <div class="upload-icon">📥</div>
            <h4>Following Data</h4>
            <p class="upload-description">
              Upload the file containing your Instagram following list
            </p>
            <input
              type="file"
              @change="handleFollowingUpload"
              accept=".json"
              data-testid="following-file-upload"
              :key="'following-' + uploadKey"
              class="file-input"
            />
            <p class="upload-status" data-testid="following-upload-status">
              {{ followingFile ? '✓ Following file uploaded' : 'Upload following.json' }}
            </p>
          </div>
        </div>

        <div class="analyze-section">
          <button
            @click="startAnalysis"
            :disabled="!canStartAnalysis"
            class="analyze-button"
            data-testid="start-upload-analysis"
          >
            <span class="button-icon">{{ loading ? '⏳' : '📊' }}</span>
            {{ loading ? 'Analyzing...' : 'Analyze Uploaded Data' }}
          </button>

          <p class="analyze-hint" v-if="!canStartAnalysis">
            Please upload both followers and following data files to start analysis
          </p>
        </div>
      </div>

      <AnalysisResults
        v-if="dataLoaded && analysis"
        :analysis="analysis"
        :mode="dataSource"
        @reset="resetAnalysis"
        @download="downloadJson"
        @copy-url="copyProfileUrl"
      />
    </div>

    <ErrorModal
      :show="errorModal.show"
      :title="errorModal.title"
      :message="errorModal.message"
      @close="closeErrorModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { InstagramTransformerService } from '@/services/instagram-transformer.service'
import { InstagramAnalysisService } from '@/services/instagram-analysis.service'
import type {
  FollowAnalysis,
  InstagramData,
  InstagramRawListItem,
  InstagramRawFollowing,
  InstagramUser
} from '@/types/instagram'
import AnalysisResults from './AnalysisResults.vue'
import ErrorModal from './ErrorModal.vue'
import { MESSAGES } from '@/constants/messages'

const loading = ref(false)
const dataLoaded = ref(false)
const analysis = ref<FollowAnalysis | null>(null)
const dataSource = ref<'app' | 'upload'>('app')
const uploadedFiles = ref<File[]>([])

const followersFile = ref<File | null>(null)
const followingFile = ref<File | null>(null)
const parsedFollowers = ref<InstagramRawListItem[] | null>(null)
const parsedFollowing = ref<InstagramRawFollowing | null>(null)

interface InstagramModule {
  default: InstagramRawListItem[] | InstagramRawFollowing
}

interface InstagramDataFile {
  relationships_followers?: InstagramRawListItem[]
  relationships_following?: InstagramRawFollowing
}

const analysisData = ref<InstagramDataFile | null>(null)

const canStartAnalysis = computed(
  () => dataSource.value === 'app' || (parsedFollowers.value && parsedFollowing.value),
)

// Update the InstagramDataFile interface to match exactly with example files
interface InstagramDataFile {
  // For followers file (array of items)
  relationships_followers?: InstagramRawListItem[]
  // For following file (object with relationships_following array)
  relationships_following?: InstagramRawFollowing
}

// Add error modal state
const errorModal = ref({
  show: false,
  title: '',
  message: '',
})

// Add error modal methods
const showError = (title: string, message: string) => {
  errorModal.value = {
    show: true,
    title,
    message,
  }
}

const closeErrorModal = () => {
  errorModal.value.show = false
}

// First, let's update the InstagramDataStructure interface
interface InstagramDataStructure {
  relationships_followers?: InstagramRawListItem[]
  relationships_following?: InstagramRawFollowing
  string_list_data?: Array<{ value: string; href: string }>
}

// Update the type checking functions
const isFollowingFile = (data: unknown): boolean => {
  if (typeof data === 'object' && data !== null) {
    return 'relationships_following' in data;
  }
  return false;
}

const isFollowersFile = (data: unknown): boolean => {
  // Check if it's an array first
  if (Array.isArray(data)) {
    return true;
  }
  // Or check if it has the followers structure
  if (typeof data === 'object' && data !== null) {
    return 'relationships_followers' in data;
  }
  return false;
}

// Update the file handling functions
const handleFollowersUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  try {
    const file = input.files[0];
    const content = await file.text();

    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch (e) {
      showError('Invalid File Format', MESSAGES.errors.invalidFile);
      followersFile.value = null;
      parsedFollowers.value = null;
      input.value = '';
      return;
    }

    // Check if it's a following file
    if (isFollowingFile(data)) {
      showError('Wrong File Type', MESSAGES.errors.wrongFile.followers);
      followersFile.value = null;
      parsedFollowers.value = null;
      input.value = '';
      return;
    }

    // Try to parse as followers file
    if (isFollowersFile(data)) {
      if (Array.isArray(data)) {
        parsedFollowers.value = data as InstagramRawListItem[];
      } else {
        const typedData = data as { relationships_followers: InstagramRawListItem[] };
        parsedFollowers.value = typedData.relationships_followers;
      }
      followersFile.value = file;
    } else {
      showError('Invalid File Format', MESSAGES.errors.invalidFile);
      followersFile.value = null;
      parsedFollowers.value = null;
      input.value = '';
    }
  } catch (error) {
    console.error('Error processing followers file:', error);
    showError('Invalid File Format', MESSAGES.errors.invalidFile);
    followersFile.value = null;
    parsedFollowers.value = null;
    input.value = '';
  }
}

const handleFollowingUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  try {
    const file = input.files[0];
    const content = await file.text();

    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch (e) {
      showError('Invalid File Format', MESSAGES.errors.invalidFile);
      followingFile.value = null;
      parsedFollowing.value = null;
      input.value = '';
      return;
    }

    // Check if it's a followers file first
    if (isFollowersFile(data)) {
      showError('Wrong File Type', MESSAGES.errors.wrongFile.following);
      followingFile.value = null;
      parsedFollowing.value = null;
      input.value = '';
      return;
    }

    // Try to parse as following file
    if (isFollowingFile(data)) {
      parsedFollowing.value = data as InstagramRawFollowing;
      followingFile.value = file;
    } else if (Array.isArray(data)) {
      // Handle the case where it's a direct array
      parsedFollowing.value = { relationships_following: data } as InstagramRawFollowing;
      followingFile.value = file;
    } else {
      showError('Invalid File Format', MESSAGES.errors.invalidFile);
      followingFile.value = null;
      parsedFollowing.value = null;
      input.value = '';
    }
  } catch (error) {
    console.error('Error processing following file:', error);
    showError('Invalid File Format', MESSAGES.errors.invalidFile);
    followingFile.value = null;
    parsedFollowing.value = null;
    input.value = '';
  }
}

// Update the module imports type
interface InstagramModule {
  default: InstagramRawListItem[] | InstagramRawFollowing
}

// Update the startAnalysis function
const startAnalysis = async () => {
  loading.value = true
  try {
    let followersData: InstagramRawListItem[]
    let followingData: InstagramRawFollowing

    if (dataSource.value === 'app') {
      const followersFiles = import.meta.glob<InstagramModule>('../data/followers/*.json')
      const followingFiles = import.meta.glob<InstagramModule>('../data/following/*.json')

      console.log('Available followers files:', Object.keys(followersFiles))
      console.log('Available following files:', Object.keys(followingFiles))

      const [followersModule, followingModule] = await Promise.all([
        Object.values(followersFiles)[0](),
        Object.values(followingFiles)[0](),
      ])

      console.log('Loaded followers data:', followersModule.default)
      console.log('Loaded following data:', followingModule.default)

      followersData = followersModule.default as InstagramRawListItem[]
      followingData = followingModule.default as InstagramRawFollowing
    } else {
      if (!parsedFollowers.value || !parsedFollowing.value) {
        throw new Error('Please upload both followers and following data files')
      }

      followersData = parsedFollowers.value
      followingData = parsedFollowing.value
    }

    const followers = InstagramTransformerService.transformFollowers(followersData)
    const following = InstagramTransformerService.transformFollowing(followingData)

    console.log('Transformed followers:', followers)
    console.log('Transformed following:', following)

    const data: InstagramData = {
      followers,
      following,
    }

    const analysisService = new InstagramAnalysisService(data)
    const result = await analysisService.analyzeFollowers()

    console.log('Analysis result:', result)

    // Convert any string dates to Date objects
    const processedResult: FollowAnalysis = {
      ...result,
      followers: result.followers.map(f => ({
        ...f,
        followedAt: new Date(f.followedAt)
      })),
      following: result.following.map(f => ({
        ...f,
        followedAt: new Date(f.followedAt)
      })),
      notFollowingBack: result.notFollowingBack.map(f => ({
        ...f,
        followedAt: new Date(f.followedAt)
      })),
      notFollowedBack: result.notFollowedBack.map(f => ({
        ...f,
        followedAt: new Date(f.followedAt)
      })),
      mutualFollows: result.mutualFollows.map(f => ({
        ...f,
        followedAt: new Date(f.followedAt)
      }))
    }

    console.log('Processed result:', processedResult)

    analysis.value = processedResult
    dataLoaded.value = true
  } catch (error) {
    console.error('Analysis failed:', error)
    showError(
      'Analysis Failed',
      error instanceof Error
        ? error.message
        : 'Failed to analyze data. Please check the data files.',
    )
  } finally {
    loading.value = false
  }
}

const copyProfileUrl = (url: string) => {
  navigator.clipboard.writeText(url)
}

const downloadJson = () => {
  if (!analysis.value) return

  const dataStr = JSON.stringify(analysis.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'instagram-analysis.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const resetAnalysis = () => {
  if (dataSource.value === 'app') {
    // For app data, just reset the analysis and start a new one
    analysis.value = null
    dataLoaded.value = false
    startAnalysis() // Immediately start new analysis
  } else {
    // For upload mode, go back to upload screen
    analysis.value = null
    dataLoaded.value = false
    resetUploadState()
    // Reset file inputs
    const inputs = document.querySelectorAll('input[type="file"]')
    inputs.forEach((input) => ((input as HTMLInputElement).value = ''))
  }
}

const setDataSource = (source: 'app' | 'upload') => {
  dataSource.value = source
  resetUploadState()
}

const resetUploadState = () => {
  uploadedFiles.value = []
  analysisData.value = null
  followersFile.value = null
  followingFile.value = null
  parsedFollowers.value = null
  parsedFollowing.value = null
  analysis.value = null
  dataLoaded.value = false
}

type Step = 'choose-source' | 'app-analysis' | 'upload-analysis'

const currentStep = ref<Step>('choose-source')
const uploadKey = ref(0) // Used to force input reset

const selectDataSource = async (source: 'app' | 'upload') => {
  dataSource.value = source
  resetUploadState()
  currentStep.value = source === 'app' ? 'app-analysis' : 'upload-analysis'

  // Automatically start analysis for app data
  if (source === 'app') {
    await startAnalysis()
  }
}

const goBack = () => {
  currentStep.value = 'choose-source'
  resetUploadState()
}

const features = {
  analysis: {
    title: 'Detailed Analysis',
    description: 'Get insights about your Instagram connections',
    icon: '📊',
  },
  nonFollowers: {
    title: 'Find Non-Followers',
    description: "Discover who doesn't follow you back",
    icon: '🔍',
  },
  privacy: {
    title: 'Privacy First',
    description: 'Your data stays on your device',
    icon: '🔒',
  },
  export: {
    title: 'Export Results',
    description: 'Download analysis results as JSON',
    icon: '💾',
  },
}
</script>
<style scoped>
.instagram-analyzer {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.start-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.upload-section {
  margin: 20px 0;
}

.upload-section h3 {
  margin-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th,
td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.stats {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.analyze-button {
  width: 100%;
  background: #0366d6;
  color: white;
  margin-top: 20px;
}

.analyze-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.download-button {
  background: #28a745;
  color: white;
}

.reset-button {
  background: #dc3545;
  color: white;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.source-selection {
  margin-bottom: 2rem;
}

.options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.options button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.options button.active {
  background-color: #007bff;
  color: white;
}

.upload-section {
  margin: 1rem 0;
  padding: 1rem;
  border: 2px dashed #ccc;
  border-radius: 4px;
}

.upload-hint {
  color: #666;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.file-upload-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.file-upload-box {
  flex: 1;
  padding: 1rem;
  border: 2px dashed #ccc;
  border-radius: 4px;
  text-align: center;
}

.file-upload-box h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.upload-status {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.upload-status:has(+ input[type='file']:valid) {
  color: #28a745;
}

.step-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.back-button {
  background: transparent;
  border: none;
  color: #666;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
}

.back-button:hover {
  color: #333;
}

.source-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.source-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
  &:hover {
    border-color: #007bff;
    transform: translateY(-2px);
  }

  &.active {
    border-color: #007bff;
    background: #f8f9fa;
  }
}

.source-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.source-button h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.source-button p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}

.upload-container {
  max-width: 800px;
  margin: 0 auto;
}

.upload-instructions {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.file-upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.file-upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.file-upload-box:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.file-upload-box h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
}

.upload-description {
  color: #666;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.file-input {
  width: 100%;
  max-width: 220px;
  margin: 1rem 0;
}

.upload-status {
  font-weight: 500;
  color: #666;
}

.upload-status:has(+ input[type='file']:valid) {
  color: #28a745;
}

.analyze-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analyze-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 500;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.analyze-button:not(:disabled):hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.analyze-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.button-icon {
  font-size: 1.2rem;
}

.analyze-hint {
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.landing-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.landing-header {
  text-align: center;
  margin-bottom: 3rem;
}

.landing-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.source-selection {
  text-align: center;
}

.source-selection h2 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.source-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.source-button {
  display: flex;
  align-items: flex-start;
  padding: 2rem;
  border: 2px solid #eee;
  border-radius: 12px;
  background: white;
  transition: all 0.2s ease;
  text-align: left;
}

.source-button:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.source-button.active {
  border-color: #007bff;
  background: #f8f9fa;
}

.source-icon {
  font-size: 2.5rem;
  margin-right: 1.5rem;
}

.source-content {
  flex: 1;
}

.source-content h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.source-content p {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
}

.source-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .landing-header h1 {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .source-options {
    grid-template-columns: 1fr;
  }
}
</style>
