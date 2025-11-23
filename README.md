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
