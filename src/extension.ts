import * as vscode from 'vscode';
import { getLinkIndices, getLinkStyles } from './utils/parser';
import { createDecorationOptions } from './utils/decoration';

let idDecorationType: vscode.TextEditorDecorationType;

export function activate(context: vscode.ExtensionContext) {
    idDecorationType = vscode.window.createTextEditorDecorationType({
        after: {
            margin: '0 0 0 1em',
            color: 'white',
            fontWeight: 'bold'
        }
    });
    
    const updateActiveEditorDecorations = () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && isMermaidFile(editor.document)) {
            updateDecorations(editor);
        }
    };

    if (vscode.window.activeTextEditor && isMermaidFile(vscode.window.activeTextEditor.document)) {
        updateActiveEditorDecorations();
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && isMermaidFile(editor.document)) {
                updateDecorations(editor);
            }
        }),
        vscode.workspace.onDidOpenTextDocument(document => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document === document);
            if (editor && isMermaidFile(editor.document)) {
                updateDecorations(editor);
            }
        }),
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document === event.document);
            if (editor && isMermaidFile(editor.document)) {
                updateDecorations(editor);
            }
        }),
        vscode.commands.registerCommand('extension.annotateMermaid', updateActiveEditorDecorations)
    );
}

export function deactivate() {
    if (idDecorationType) {
        idDecorationType.dispose();
    }
}

function updateDecorations(editor: vscode.TextEditor) {
    const document = editor.document;
    const text = document.getText();

    const linkIndices = getLinkIndices(text);
    const linkStyles = getLinkStyles(text);

    const decorations = createDecorationOptions(linkIndices, linkStyles, document);

    editor.setDecorations(idDecorationType, decorations);
}

function isMermaidFile(document: vscode.TextDocument): boolean {
    return document.languageId === 'mermaid' || document.languageId === 'mmd';
}
