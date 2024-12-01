export const TEXT = {
  landing: {
    title: 'Instagram Analyzer',
    subtitle: 'Analyze your Instagram followers and following',
    features: [
      {
        title: 'Detailed Analysis',
        description: 'Get insights about your Instagram connections',
        icon: '📊',
      },
      {
        title: 'Find Non-Followers',
        description: "Discover who doesn't follow you back",
        icon: '🔍',
      },
      {
        title: 'Privacy First',
        description: 'Your data stays on your device',
        icon: '🔒',
      },
      {
        title: 'Export Results',
        description: 'Download analysis results as JSON',
        icon: '💾',
      },
    ],
    dataSource: {
      title: 'Choose Your Data Source',
      app: {
        title: 'Use App Data',
        description: 'Quick analysis using sample data',
        badge: 'Instant Results',
      },
      upload: {
        title: 'Upload Instagram Data',
        description: 'Analyze your own Instagram data',
        badge: 'Custom Analysis',
      },
    },
  },
  upload: {
    title: 'Upload Instagram Data',
    instruction:
      'Please upload your Instagram data files. You can find these files in your Instagram data export.',
    followers: {
      title: 'Followers Data',
      description: 'Upload the file containing your Instagram followers list',
      placeholder: 'Choose File',
      uploadText: 'Upload followers.json',
      success: 'Followers file uploaded',
    },
    following: {
      title: 'Following Data',
      description: 'Upload the file containing your Instagram following list',
      placeholder: 'Choose File',
      uploadText: 'Upload following.json',
      success: 'Following file uploaded',
    },
    analyze: {
      title: 'Analyze Uploaded Data',
      hint: 'Please upload both followers and following data files to start analysis',
    },
    button: {
      back: '← Back',
    },
  },
  results: {
    title: 'Analysis Results',
    summary: {
      followers: 'Total Followers',
      following: 'Total Following',
      nonFollowers: 'Non-Followers',
      mutualConnections: 'Mutual Connections',
    },
    actions: {
      newAnalysis: 'New Analysis',
      uploadNewData: 'Upload New Data',
      export: 'Export Results',
    },
  },
  errors: {
    invalidFollowersModal: 'Invalid Followers File',
    invalidFollowingModal: 'Invalid Following File',
    wrongFile: {
      followers:
        'This appears to be a following list file. Please try uploading it to the Following Data section instead.',
      following:
        'This appears to be a followers list file. Please try uploading it to the Followers Data section instead.',
    },
    invalidFile: 'Invalid file format. Please upload a valid JSON file from your Instagram data export.',
  },
} as const
