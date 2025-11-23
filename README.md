# Backlog Accelerator

A desktop application to generate, visualise, and organise Agile backlogs using Generative AI.

## Goals
- Simple and robust local desktop application
- Generate Epics, Features, and User Stories using AI
- Visualise the backlog hierarchy (Epic → Feature → Story) with attractice UI
- Allow editing, reordering, and refining items
- Offline-first with local SQLite storage
- Secure: no unnecessary external communication

## Tech Stack
- Electron for the desktop shell
- React + TypeScript for the UI
- SQLite for storage (better-sqlite3)
- Azure AI Foundry for generative features (GPT 5.1 mini)
- Vite for frontend tooling
- Vitest and Playwright for testing

## Core Features
- Create and edit Epics, Features, and User Stories
- Drag-and-drop visual hierarchy
- Generate backlog items from user input via AI
- Save all content locally
- Export and import backlogs

## Dev Standards
- Local development must be use a docker container
- Code quality is a priority
- Code lint must run after each change
- Tests must always be implemented and ran

## Development

### Prerequisites
- Node.js >= 20.11.0
- npm >= 10.0.0

### Setup
```bash
npm install
cd frontend && npm install
```

### Development
```bash
npm run dev  # Starts Vite dev server + Electron in watch mode
```

### Building
```bash
npm run build  # Builds both main and renderer
npm run package  # Creates distributable packages
```

### Testing
```bash
npm run lint  # ESLint
npm run typecheck  # TypeScript type checking
npm run test:unit  # Vitest unit tests
npm run test:e2e  # Playwright E2E tests
npm run check  # Runs all quality checks
```

### Packaging & Distribution

The project uses GitHub Actions to automatically build installers for Windows, macOS, and Linux.

**Windows builds are currently enabled.** To enable macOS and Linux builds, uncomment the respective jobs in `.github/workflows/build.yml`.

#### Creating a Release
1. Commit and push your changes
2. Create a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions will automatically:
   - Build Windows installer (.exe)
   - Run all quality checks
   - Create a GitHub Release with downloadable artifacts

#### Manual Local Packaging
```bash
npm run package  # Builds for current platform
npx electron-builder --win  # Windows (requires Wine on Linux/Mac)
npx electron-builder --mac  # macOS (requires Mac)
npx electron-builder --linux  # Linux
```

## Architecture (High-level)
- `main` process: Electron backend, SQLite access, IPC handlers
- `renderer` process: React UI and visualisations
- `ai` module: Azure GPT 5.1 prompts & logic

## Next Steps
1. Scaffold the project structure with Electron + Vite + React + TypeScript.
2. Add SQLite initialization.
3. Build the basic backlog domain model.
4. Implement a minimal UI and IPC wiring.
5. Add AI generation features.
