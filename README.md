# OpenClaw Remote Assistant (VSCode Extension)

Talk to Alice from OpenClaw directly inside VSCode!

## Features
- **Sidebar Chat UI**: Ask Alice questions and get answers directly inside VSCode.
- **Context Extractor**: Automatically sends your current active file, workspace directory, and selected code as context to Alice.
- **Code Apply**: AI code blocks are rendered with an "Apply Code" button that seamlessly inserts or replaces selected code in your editor.

## Setup Instructions

### 1. The Backend Bridge
The backend folder contains a Node.js server that bridges the gap between VSCode and OpenClaw.
```bash
cd backend
npm install
npm start
```
By default, it runs on port 3000.

### 2. The VSCode Extension
```bash
npm install
npm run compile
```
Press `F5` in VSCode to launch a new extension development host with the OpenClaw extension running.

## Usage
Open the OpenClaw icon in the activity bar, and type your request.
When Alice replies with a code snippet, click "Apply Code" to instantly paste it into your editor!
