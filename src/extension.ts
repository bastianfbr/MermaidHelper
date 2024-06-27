import * as vscode from 'vscode';

let idDecorationType: vscode.TextEditorDecorationType;

export function activate(context: vscode.ExtensionContext) {
    idDecorationType = vscode.window.createTextEditorDecorationType({
        after: {
            margin: '0 0 0 1em',
            color: 'white',
            fontWeight: 'bold'
        }
    });

    if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDecorations(editor);
            }
        }),

        vscode.workspace.onDidOpenTextDocument(document => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document === document);
            if (editor) {
                updateDecorations(editor);
            }
        }),

        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document === event.document);
            if (editor) {
                updateDecorations(editor);
            }
        }),

        vscode.commands.registerCommand('extension.annotateMermaid', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                updateDecorations(editor);
            }
        })
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

    const decorations: vscode.DecorationOptions[] = [];

    // Add link ID decorations
    for (const linkIndex of linkIndices) {
        const startPos = document.positionAt(linkIndex.index);
        const endPos = document.positionAt(linkIndex.index + linkIndex.length);
        const range = new vscode.Range(startPos, endPos);

        const decoration = {
            range: range,
            renderOptions: {
                after: {
                    contentText: `ID: ${linkIndex.id}`
                }
            }
        };

        decorations.push(decoration);
    }

    // Add linkStyle decorations with color coding
    for (const linkStyle of linkStyles) {
        const startPos = document.positionAt(linkStyle.index);
        const endPos = document.positionAt(linkStyle.index + linkStyle.length);
        const range = new vscode.Range(startPos, endPos);

        const relatedLink = linkIndices.find(link => link.id === linkStyle.id);
        if (relatedLink) {
            const colorMatch = /stroke:(#[0-9A-Fa-f]{6})/.exec(linkStyle.line);
            const color = colorMatch ? colorMatch[1] : 'gray';

            const decoration = {
                range: range,
                renderOptions: {
                    after: {
                        contentText: `Relation: ${relatedLink.line}`,
                        color: color
                    }
                }
            };

            decorations.push(decoration);
        }
    }

    editor.setDecorations(idDecorationType, decorations);
}

interface LinkIndex {
    index: number;
    length: number;
    id: number;
    line: string;
}

interface LinkStyle {
    index: number;
    length: number;
    id: number;
    line: string;
}

function getLinkIndices(text: string): LinkIndex[] {
    const lines = text.split('\n');
    let linkIndex = 0;
    const linkIndices: LinkIndex[] = [];

    for (const line of lines) {
        const match = /(-->|---)/.exec(line);
        if (match) {
            linkIndices.push({
                index: text.indexOf(line),
                length: line.length,
                id: linkIndex,
                line: line
            });
            linkIndex++;
        }
    }

    return linkIndices;
}

function getLinkStyles(text: string): LinkStyle[] {
    const lines = text.split('\n');
    const linkStyles: LinkStyle[] = [];

    for (const line of lines) {
        const match = /linkStyle (\d+)/.exec(line);
        if (match) {
            linkStyles.push({
                index: text.indexOf(line),
                length: line.length,
                id: parseInt(match[1]),
                line: line
            });
        }
    }

    return linkStyles;
}
