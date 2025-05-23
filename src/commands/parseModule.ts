import * as vscode from 'vscode';
import { DCollection, applyDCollection } from '../diagnostic';
import { TranspilerStdoutParser } from '../parsers/pluscal';
import { SanyData, SanyStdoutParser } from '../parsers/sany';
import { runPlusCal, runSany } from '../tla2tools';
import { ToolOutputChannel } from '../outputChannels';
import { LANG_TLAPLUS } from '../common';

export const CMD_PARSE_MODULE = 'tlaplus.parse';

const plusCalOutChannel = new ToolOutputChannel('PlusCal');
const sanyOutChannel = new ToolOutputChannel('SANY');

/**
 * Parses .tla module:
 * - Transpiles PlusCal to TLA+
 * - Parses resulting TLA+ specification and checks for syntax errors
 */
export function parseModule(diagnostic: vscode.DiagnosticCollection): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No editor is active, cannot find a TLA+ file to transpile');
        return;
    }
    if (editor.document.languageId !== LANG_TLAPLUS) {
        vscode.window.showWarningMessage('File in the active editor is not a TLA+ file, it cannot be transpiled');
        return;
    }
    editor.document.save().then(() => doParseFile(editor.document, diagnostic));
}

async function doParseFile(doc: vscode.TextDocument, diagnostic: vscode.DiagnosticCollection) {
    try {
        const messages = await transpilePlusCal(doc.uri);
        vscode.window.showTextDocument(doc);    // To force changes reloading
        const specData = await parseSpec(doc.uri);
        messages.addAll(specData.dCollection);
        applyDCollection(messages, diagnostic);
    } catch (err) {
        vscode.window.showErrorMessage(`Error parsing file: ${err}`);
    }
}

/**
 * Transpiles PlusCal code in the current .tla file to TLA+ code in the same file.
 */
export async function transpilePlusCal(fileUri: vscode.Uri): Promise<DCollection> {
    const procInfo = await runPlusCal(fileUri.fsPath);
    plusCalOutChannel.bindTo(procInfo);
    const stdoutParser = new TranspilerStdoutParser(procInfo.process.stdout, fileUri.fsPath);
    return stdoutParser.readAll();
}

/**
 * Parses the resulting TLA+ spec.
 */
export async function parseSpec(fileUri: vscode.Uri): Promise<SanyData> {
    const procInfo = await runSany(fileUri.fsPath);
    sanyOutChannel.bindTo(procInfo);
    const stdoutParser = new SanyStdoutParser(procInfo.process.stdout);
    return stdoutParser.readAll();
}
