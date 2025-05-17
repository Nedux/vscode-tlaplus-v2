import * as vscode from 'vscode';
import { TlaDocumentInfos } from '../model/documentInfo';

export const TLAPLUS_SHOW_FILE_CONTENT_PICKER = "tlaplus.navigateToFileContents";

export async function navigateToFileContents(tlaDocInfos: TlaDocumentInfos): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor.');
        return;
    }
    const docInfo = tlaDocInfos.get(editor.document.uri);
    const symbols = docInfo?.symbols || [];

    const relevantSymbols = symbols.filter(sym =>
        sym.kind === vscode.SymbolKind.Boolean ||
        sym.kind === vscode.SymbolKind.Function
    );

    if (relevantSymbols.length === 0) {
        vscode.window.showInformationMessage('No relevant symbols found.');
        return;
    }

    const selectedSymbol = await vscode.window.showQuickPick(
        relevantSymbols.map(t => ({
            label: t.name,
            description: `(${t.kind === vscode.SymbolKind.Boolean ? 'Theorem' : 'Function'})`,
            symbol: t
        })),
        { placeHolder: 'Select symbol to navigate to' }
    );

    if (selectedSymbol) {
        const pos = selectedSymbol.symbol.location.range.start;
        const newSelection = new vscode.Selection(pos, pos);
        editor.selection = newSelection;
        editor.revealRange(selectedSymbol.symbol.location.range);
    }
}