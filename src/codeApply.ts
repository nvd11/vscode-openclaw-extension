import * as vscode from 'vscode';

export async function applyCode(code: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('No active editor to apply code.');
    return;
  }
  
  const selection = editor.selection;
  await editor.edit(editBuilder => {
    if (selection.isEmpty) {
      editBuilder.insert(editor.selection.active, code);
    } else {
      editBuilder.replace(selection, code);
    }
  });
}
