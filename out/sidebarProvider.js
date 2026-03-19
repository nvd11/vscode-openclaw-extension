"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenClawSidebarProvider = void 0;
const cp = __importStar(require("child_process"));
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const contextExtractor_1 = require("./contextExtractor");
const codeApply_1 = require("./codeApply");
class OpenClawSidebarProvider {
    _extensionUri;
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "sendMessage": {
                    if (!data.value)
                        return;
                    const contextData = await (0, contextExtractor_1.extractContext)();
                    const config = vscode.workspace.getConfiguration('openclaw');
                    const bridgeUrl = config.get('bridgeUrl') || 'http://localhost:3000/api/chat';
                    try {
                        const response = await axios_1.default.post(bridgeUrl, {
                            message: data.value,
                            context: contextData
                        });
                        const reply = response.data.reply;
                        webviewView.webview.postMessage({ type: 'receiveMessage', value: reply });
                    }
                    catch (error) {
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
                            if (error)
                                output += "\nError: " + error.message;
                            if (stderr)
                                output += "\nStderr: " + stderr;
                            webviewView.webview.postMessage({ type: 'commandResult', value: output.substring(0, 2000) });
                        });
                    }
                    break;
                }
                case "applyCode": {
                    if (data.value) {
                        await (0, codeApply_1.applyCode)(data.value);
                    }
                    break;
                }
            }
        });
    }
    _getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.js"));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "style.css"));
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
exports.OpenClawSidebarProvider = OpenClawSidebarProvider;
//# sourceMappingURL=sidebarProvider.js.map