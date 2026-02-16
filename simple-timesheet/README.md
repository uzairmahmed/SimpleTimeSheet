# Simple Timesheet - Modern Rewrite

A modern desktop timesheet application built with Tauri, React, Vite, and MongoDB.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Desktop Framework**: Tauri 2.0
- **UI Components**: ShadCN UI (Tailwind CSS)
- **Backend**: Rust (Tauri commands)
- **Database**: MongoDB
- **Containerization**: Docker Compose

## Features

- 🎨 Clean, modern UI with ShadCN components
- ⚡ Fast build times with Vite
- 🖥️ Native desktop app with Tauri
- 💾 Stable MongoDB database
- 🐳 Easy setup with Docker Compose
- 👥 Employee management
- ⏱️ Hour logging and tracking
- 📊 Timesheet viewing and reporting

## Prerequisites

### For Development

#### Linux (Ubuntu/Debian)
```bash
# Install system dependencies for Tauri
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

#### Windows
```bash
# Install Microsoft Visual Studio C++ Build Tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### Required Tools

- **Node.js** (v18+)
- **Rust** (latest stable)
- **Docker & Docker Compose**

## Getting Started

### 1. Start the Database

```bash
# From the root directory
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Mongo Express (web UI) on port 8081

Access Mongo Express at http://localhost:8081 (no auth required)

### 2. Install Dependencies

```bash
cd simple-timesheet
npm install
```

### 3. Run Development Server

```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server
- Build and launch the Tauri desktop app
- Auto-reload on file changes

## Building for Production

### Desktop Application

```bash
cd simple-timesheet
npm run tauri:build
```

The built application will be in `src-tauri/target/release/bundle/`

## Project Structure

```
simple-timesheet/
├── src/                      # React frontend
│   ├── components/           # UI components
│   │   ├── ui/              # ShadCN UI components
│   │   └── UserCard.tsx     # Custom components
│   ├── pages/               # Application pages
│   │   ├── HomePage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── EmployeePage.tsx
│   │   └── ViewPage.tsx
│   ├── services/            # API services
│   ├── types/               # TypeScript types
│   ├── lib/                 # Utility functions
│   └── App.tsx              # Main app component
├── src-tauri/               # Tauri backend
│   ├── src/
│   │   ├── db.rs           # Database operations
│   │   ├── commands.rs     # Tauri commands
│   │   ├── lib.rs          # Main library
│   │   └── main.rs         # Entry point
│   └── Cargo.toml          # Rust dependencies
└── docker-compose.yml       # MongoDB setup
```

## Database Schema

### Employees Collection
```json
{
  "_id": "string",
  "name": "string",
  "notes": "string",
  "pay": "number"
}
```

### Timesheet Entries Collection
```json
{
  "_id": "string",
  "employee_id": "string",
  "employee_name": "string",
  "date": "string (ISO 8601)",
  "hours": "number",
  "notes": "string"
}
```

### Current Timesheet Collection
```json
{
  "_id": "string",
  "start_date": "string (ISO 8601)",
  "end_date": "string (ISO 8601)"
}
```

## Configuration

### Database Connection

The MongoDB connection string can be configured via environment variable:

```bash
# Set the MONGODB_URI environment variable
export MONGODB_URI="mongodb://admin:admin123@localhost:27017"
```

If not set, it defaults to `mongodb://admin:admin123@localhost:27017` for development.

**Production:** Always use environment variables for database credentials. Never commit credentials to source control.

To use a different database:
1. Set the `MONGODB_URI` environment variable
2. Update docker-compose.yml with new credentials

### Admin Authentication

**⚠️ Security Note:** The current admin authentication is a simple client-side password check for demonstration purposes only. The default password is `admin123`.

**For Production:** Implement proper server-side authentication:
1. Create a Tauri command for authentication
2. Use secure password hashing (e.g., bcrypt, argon2)
3. Store hashed passwords in the database
4. Implement session management or JWT tokens

## Migrating from Old System

The old Electron-based system used Firebase Realtime Database. To migrate:

1. Export your Firebase data
2. Transform the data to match the MongoDB schema
3. Import into MongoDB using mongoimport or Mongo Express

## Troubleshooting

### Build Errors on Linux

Make sure all system dependencies are installed:
```bash
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

### Database Connection Issues

1. Ensure Docker containers are running: `docker-compose ps`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify connection string in `src-tauri/src/lib.rs`

### Port Conflicts

If ports 27017 or 8081 are already in use, update docker-compose.yml:
```yaml
ports:
  - "27018:27017"  # Use port 27018 instead
```

## Development Tips

### Hot Reload

- Frontend changes auto-reload in dev mode
- Backend Rust changes require restart (Ctrl+C and `npm run tauri:dev` again)

### Debugging

- Frontend: Use browser DevTools (opens automatically in dev mode)
- Backend: Use `log::info!()` macros (check terminal output)

## License

MIT

## Credits

Originally created by Uzair Ahmed
Rewritten with modern tech stack: Tauri + React + Vite + ShadCN + MongoDB
