import { defineStore } from 'pinia'
import type { AnalysisResult } from '@/types/instagram'

export const useInstagramStore = defineStore('instagram', {
  state: () => ({
    analysis: null as AnalysisResult | null,
  }),
  actions: {
    setAnalysis(analysis: AnalysisResult) {
      this.analysis = analysis
    },
    clearAnalysis() {
      this.analysis = null
    },
  },
})
