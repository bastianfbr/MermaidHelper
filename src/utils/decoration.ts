import * as vscode from 'vscode';
import { LinkIndex } from '../interfaces/linkIndex';
import { LinkStyle } from '../interfaces/linkStyle';

export function createDecorationOptions(linkIndices: LinkIndex[], linkStyles: LinkStyle[], document: vscode.TextDocument): vscode.DecorationOptions[] {
    const decorations: vscode.DecorationOptions[] = [];

    // Add link ID decorations
    linkIndices.forEach(linkIndex => {
        const startPos = document.positionAt(linkIndex.index);
        const endPos = document.positionAt(linkIndex.index + linkIndex.length);
        const range = new vscode.Range(startPos, endPos);

        decorations.push({
            range: range,
            renderOptions: {
                after: {
                    contentText: `ID: ${linkIndex.id}`
                }
            }
        });
    });

    // Add linkStyle decorations with color coding
    linkStyles.forEach(linkStyle => {
        const startPos = document.positionAt(linkStyle.index);
        const endPos = document.positionAt(linkStyle.index + linkStyle.length);
        const range = new vscode.Range(startPos, endPos);

        const relatedLink = linkIndices.find(link => link.id === linkStyle.id);
        if (relatedLink) {
            const colorMatch = /stroke:(#[0-9A-Fa-f]{6})/.exec(linkStyle.line);
            const color = colorMatch ? colorMatch[1] : 'gray';

            decorations.push({
                range: range,
                renderOptions: {
                    after: {
                        contentText: `Relation: ${relatedLink.line}`,
                        color: color
                    }
                }
            });
        }
    });

    return decorations;
}
