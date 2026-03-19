# OpenClaw Remote Assistant Architecture

## Overview
This project contains two components:
1. **VSCode Extension (Client)**: A TypeScript-based UI and context-aware tool that runs entirely inside VSCode.
2. **Backend Bridge (Server)**: A Node.js API that serves as an intermediary between the VSCode extension and the OpenClaw service.

## Components

### VSCode Extension
- **Sidebar UI (Webview)**: Provides an interactive HTML/JS chat interface embedded in the VSCode activity bar. It handles user text input and renders HTML messages from Alice.
- **Context Extractor (`src/contextExtractor.ts`)**: Collects context from the active editor, including:
  - Current file path (`editor.document.fileName`)
  - Currently highlighted selection (`editor.document.getText`)
  - Opened workspace paths
- **Code Apply Feature (`src/codeApply.ts`)**: Takes an incoming string of code and executes a `TextEditorEdit` to replace the user's active selection (or inserts at cursor if empty).
- **Communication Flow**: 
  - User submits a prompt.
  - Context is gathered.
  - An HTTP POST request is made using `axios` from the extension's backend to `http://localhost:3000/api/chat`.
  - The JSON response is parsed and passed to the Webview to render.

### Backend Bridge
- **Purpose**: A lightweight Node.js Express server (`backend/server.js`) that safely manages the connection to the actual OpenClaw API without needing to expose internal OpenClaw logic to VSCode.
- **Flow**: 
  - Receives `message` and `context` from the VSCode extension.
  - Forwards the request to OpenClaw (`OPENCLAW_API`).
  - Returns the generated reply back to the extension.
