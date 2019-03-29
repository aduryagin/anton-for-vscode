// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fetch from 'node-fetch';
import debounce from 'lodash/debounce';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const checkThatEnabled = (): { branch: string, project: string } => {
  const rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.path : '';

  if (rootPath && rootPath.indexOf('hc_market') > -1) {
    const branch = require('child_process').execSync(`cd ${rootPath}; git rev-parse --abbrev-ref HEAD`).toString().trim().replace(/\D/g, '');
    return { branch, project: 'MRPL' };
  }

  return { branch: '', project: '' };
};

export function activate(context: vscode.ExtensionContext) {
  const projectData = checkThatEnabled();

  if (projectData.branch && projectData.project) {
    const { branch, project } = projectData;

    const sendToAnton = debounce(() => {
      fetch(encodeURI(`https://console.dialogflow.com/api-client/demo/embedded/52d9e889-9db3-477d-b0cd-e16039e07af6/demoQuery?q=пишу код для ${project} ${branch}&sessionId=1`));
    }, 2000);
  
    const onEvent = () => {
      let editor = vscode.window.activeTextEditor;
  
      if (editor) {
        let doc = editor.document;
  
        if (doc) {
          let file: string = doc.fileName;
  
          if (file) {
            sendToAnton();
          }
        }
      }
    };

    const subscriptions: vscode.Disposable[] = [];
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(onEvent, {}, subscriptions));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(onEvent, {}, subscriptions));
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(onEvent, {}, subscriptions));
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
}
