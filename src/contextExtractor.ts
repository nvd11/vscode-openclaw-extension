import * as vscode from 'vscode';

export async function extractContext() {
  const editor = vscode.window.activeTextEditor;
  let file = 'No active file';
  let selection = 'No selected code';
  let workspace = 'No workspace opened';

  if (editor) {
    file = editor.document.fileName;
    selection = editor.document.getText(editor.selection);
  }

  if (vscode.workspace.workspaceFolders) {
    workspace = vscode.workspace.workspaceFolders.map(f => f.uri.fsPath).join(', ');
  }

  return { file, selection, workspace };
}
