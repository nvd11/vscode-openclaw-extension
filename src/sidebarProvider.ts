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
          try {
            const response = await axios.post('http://localhost:3000/api/chat', {
              message: data.value,
              context: contextData
            });
            const reply = response.data.reply;
            webviewView.webview.postMessage({ type: 'receiveMessage', value: reply });
          } catch (error) {
            vscode.window.showErrorMessage('Failed to connect to OpenClaw bridge.');
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
