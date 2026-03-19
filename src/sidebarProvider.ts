import * as cp from 'child_process';
import * as vscode from 'vscode';
import axios from 'axios';
import { extractContext } from './contextExtractor';
import { applyCode } from './codeApply';

export class OpenClawSidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "sendMessage": {
          if (!data.value) return;
          const contextData = await extractContext();
          const config = vscode.workspace.getConfiguration('openclaw');
          const bridgeUrl = config.get<string>('bridgeUrl') || 'http://localhost:3000/api/chat';
          try {
            
            const response = await axios.post(bridgeUrl, {
              message: data.value,
              context: contextData
            });
            const reply = response.data.reply;
            webviewView.webview.postMessage({ type: 'receiveMessage', value: reply });
          } catch (error) {
            vscode.window.showErrorMessage(`Failed to connect to OpenClaw bridge at ${bridgeUrl}`);
          }
          break;
        }

        case "runCommand": {
          if (data.value) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const cwd = workspaceFolders ? workspaceFolders[0].uri.fsPath : process.cwd();
            cp.exec(data.value, { cwd }, (error, stdout, stderr) => {
              let output = stdout;
              if (error) output += "\nError: " + error.message;
              if (stderr) output += "\nStderr: " + stderr;
              webviewView.webview.postMessage({ type: 'commandResult', value: output.substring(0, 2000) });
            });
          }
          break;
        }

        case "applyCode": {
          if (data.value) {
            await applyCode(data.value);
          }
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "style.css")
    );

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link href="${styleUri}" rel="stylesheet">
        <title>Alice Assistant</title>
      </head>
      <body>
        <div id="chat-container">
          <div id="messages"></div>
          <div class="input-area">
            <textarea id="prompt-input" placeholder="Talk to Alice..."></textarea>
            <button id="send-btn">Send</button>
          </div>
        </div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}
