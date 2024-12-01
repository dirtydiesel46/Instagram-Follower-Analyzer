# Instagram Follower Analyzer

A Vue 3 application that helps you analyze your Instagram followers and following lists to identify non-mutual connections.

## Why This Project?

This project was born out of several key considerations:

- **API Safety**: Using Instagram's API for follower analysis can risk account bans or restrictions
- **Privacy First**: Existing online tools often require login credentials or store your data
- **Manual but Secure**: Provides a middle-ground solution where you manually export your Instagram data but get automated analysis
- **Local Processing**: All data analysis happens in your browser - no data is ever sent to any server
- **Full Control**: You maintain complete control over your Instagram data while still getting useful insights

The goal is to provide a secure, private way to analyze your Instagram connections without risking your account or compromising your data privacy.

## Features

- Upload and analyze Instagram followers/following data
- Identify users who don't follow you back
- Identify users you don't follow back
- Privacy-focused: All analysis happens locally in your browser
- No Instagram login required

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/instagram-follower-analyzer.git
cd instagram-follower-analyzer
```

2. Install dependencies:

```bash
npm install
```


Note 3 & 4 can be ignored and you could utilize the FE to upload the raw files from Instagram 

3. Set up your Instagram data:

```bash
# Copy the example data files
cp src/data/followers/followers_example.json src/data/followers/followers_1.json
cp src/data/following/following_example.json src/data/following/following.json
```

4. Replace the copied files with your Instagram data:
   - Export your followers list from Instagram and save as `followers_1.json`
   - Export your following list from Instagram and save as `following.json`
  

Note: The real data files are gitignored to protect your privacy.

## Development

Start the development server:

```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint code

### E2E Testing with Playwright

```bash
# Install browsers for the first run
npx playwright install

# Run all tests
npm run test:e2e

# Run tests in specific browser
npm run test:e2e -- --project=chromium

# Run specific test file
npm run test:e2e -- tests/example.spec.ts

# Run tests in debug mode
npm run test:e2e -- --debug
```

## IDE Setup

For the best development experience, we recommend:
- [VSCode](https://code.visualstudio.com/)
- Any TypeScript-compatible extension of your choice

## TypeScript Support

This project uses TypeScript for type safety. Type checking is integrated into the build process:

- `npm run build` - Includes type checking during production build
- `npm run typecheck` - Run type checking separately (you may need to add this script)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
