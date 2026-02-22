# SimpleTimeSheet

A modern desktop timesheet application for tracking employee hours.

## 🎉 New Modern Rewrite Available!

This repository has been rewritten from scratch with modern technologies:

**Old Stack** (in `timesheets/` directory):
- Electron + Create React App
- Chakra UI
- Firebase Realtime Database

**New Stack** (in `simple-timesheet/` directory):
- ⚡ Tauri 2.0 - Lightweight desktop framework
- ⚡ Vite + React 19 + TypeScript - Fast development
- 🎨 ShadCN UI + Tailwind CSS - Modern, accessible components
- 🦀 Rust backend - Fast and secure
- 🐳 MongoDB + Docker Compose - Stable, containerized database

## Getting Started

See [simple-timesheet/README.md](./simple-timesheet/README.md) for complete documentation.

### Quick Start

```bash
# Start the database
docker-compose up -d

# Install and run the app
cd simple-timesheet
npm install
npm run tauri:dev
```

## Why Rewrite?

The original system was:
- Built on older, slower technologies (Create React App, Electron)
- Unstable database layer (Firebase Realtime DB)
- Difficult to maintain and extend

The new system provides:
- 🚀 **10x faster build times** with Vite vs CRA
- 🪶 **Smaller app size** - Tauri apps are ~10MB vs 100MB+ with Electron
- 💪 **Better stability** - MongoDB with Docker Compose
- 🎨 **Modern UI** - Beautiful, accessible ShadCN components
- 🔒 **More secure** - Rust backend with type safety

## Features

- ✅ Employee management (create, edit, delete)
- ✅ Time tracking with notes
- ✅ Bi-weekly timesheet periods
- ✅ Full timesheet view and reporting
- ✅ Clean, modern UI
- ✅ Desktop application (Windows, macOS, Linux)

## License

MIT

## Author

Uzair Ahmed
