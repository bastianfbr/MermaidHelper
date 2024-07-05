import { LinkIndex } from '../interfaces/linkIndex';
import { LinkStyle } from '../interfaces/linkStyle';

export function getLinkIndices(text: string): LinkIndex[] {
    const lines = text.split('\n');
    let linkIndex = 0;
    const linkIndices: LinkIndex[] = [];

    const linkPattern = /(?:\w+)\s*(-->|---)\s*(?:\w+)/;

    for (const line of lines) {
        if (line.trim().startsWith('---') || line.trim().startsWith('title:')) {
            continue;
        }

        const match = linkPattern.exec(line);
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

export function getLinkStyles(text: string): LinkStyle[] {
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
