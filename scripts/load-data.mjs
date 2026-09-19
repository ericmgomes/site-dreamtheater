import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import ts from 'typescript';

export async function loadData(name) {
  const source = await readFile(new URL(`../src/data/${name}.ts`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
