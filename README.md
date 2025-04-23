# Knot Classification UI

A modern web interface for the knot classification system, built with Node.js, Vite, TailwindCSS, and DaisyUI.

## Features

- Real-time camera feed display
- Knot stage visualization
- Classification results display
- Interactive controls
- Responsive design

## Prerequisites

- Node.js (for npm package management)
- npm (Node Package Manager)

## Setup

1. Install dependencies using npm:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The UI will be available at http://localhost:3000

## Development

- Built with Node.js and Vite
- Styled with TailwindCSS and DaisyUI
- Connects to the backend API on port 8000

## Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Notes

- The UI automatically connects to the backend API on port 8000
- Make sure the backend is running before starting the UI
- The UI requires a modern web browser with WebSocket support
