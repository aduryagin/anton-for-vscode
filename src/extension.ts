// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fetch from 'node-fetch';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let lastHeartbeat: number;
let lastFile: string;

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
    const enoughTimePassed = (time: number): boolean => {
      return lastHeartbeat + 120000 < time;
    };
  
    const onEvent = () => {
      let editor = vscode.window.activeTextEditor;
  
      if (editor) {
        let doc = editor.document;
  
        if (doc) {
          let file: string = doc.fileName;
  
          if (file) {
            let time: number = Date.now();
  
            if (enoughTimePassed(time)) {
              fetch(`https://console.dialogflow.com/api-client/demo/embedded/52d9e889-9db3-477d-b0cd-e16039e07af6/demoQuery?q=пишу%20код%20для%${project}%20${branch}&sessionId=1`);
              lastFile = file;
              lastHeartbeat = time;
            }
          }
        }
      }
    };
  
    const subscriptions: vscode.Disposable[] = [];
    vscode.window.onDidChangeTextEditorSelection(onEvent, {}, subscriptions);
    vscode.window.onDidChangeActiveTextEditor(onEvent, {}, subscriptions);
    vscode.workspace.onDidSaveTextDocument(onEvent, {}, subscriptions);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
}
