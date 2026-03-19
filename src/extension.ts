import * as vscode from 'vscode';
import { OpenClawSidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  const sidebarProvider = new OpenClawSidebarProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "openclaw-sidebar",
      sidebarProvider
    )
  );
}

export function deactivate() {}
