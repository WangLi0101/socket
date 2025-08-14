# Socket.IO Real-time Communication Project

A modern Socket.IO project built with TypeScript, Rollup bundler, and comprehensive code quality tools for real-time communication applications.

## Features

- 🚀 **Express + Socket.IO Server** - HTTP REST API with real-time bidirectional communication
- 📘 **TypeScript** - Full type safety and modern JavaScript features
- 📦 **Rollup** - Efficient bundling and tree-shaking
- 🔍 **ESLint** - Code linting with TypeScript support
- 💅 **Prettier** - Consistent code formatting
- 🏗️ **Modern Build System** - Development and production builds
- 🌐 **HTTP Endpoints** - Health check and static file serving

## Project Structure

```
├── src/                    # Source code
│   ├── index.ts           # Main server entry point
│   ├── socket/            # Socket.IO related code
│   └── types/             # TypeScript type definitions
├── dist/                  # Built output
├── docs/                  # Documentation
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── rollup.config.js       # Rollup bundler configuration
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
└── README.md             # This file
```

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server with watch mode
npm run dev

# Or build and start
npm run build
npm start
```

### Development

```bash
# Development with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check

# Run all quality checks
npm run quality
```

### Production

```bash
# Build for production
npm run build:prod

# Start production server
npm start
```

## Available Scripts

- `npm run dev` - Start development server with watch mode
- `npm run build` - Build for development
- `npm run build:prod` - Build for production with optimizations
- `npm start` - Start the built server
- `npm run start:dev` - Build and start in one command
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run quality` - Run all quality checks (type-check, lint, format)
- `npm run clean` - Clean build directory

## HTTP Endpoints

The Express server provides the following HTTP endpoints:

- `GET /health` - Health check endpoint returning server status
- `GET /docs/*` - Static file serving for documentation and test client

## Socket.IO Events

The server handles the following events:

- `connection` - Client connection established
- `disconnect` - Client disconnection
- `message` - Send/receive messages

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run quality checks: `npm run quality`
5. Commit your changes
6. Push to the branch
7. Create a Pull Request

## License

MIT License - see LICENSE file for details
