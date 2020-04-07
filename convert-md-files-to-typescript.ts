import * as glob from 'glob';
import { readFileSync, writeFileSync } from 'fs';

const pattern = process.argv[2];
if (pattern == null) {
  console.error('Please provide a pattern as first argument.');
  process.exit(1);
}
const files = glob.sync(pattern);
if (files.length === 0) {
  console.error('No files found.');
  process.exit(1);
}

for (const filename of files) {
  const outputFilename = filename.replace(/\.md$/, '.ts');
  const code = convertMarkdownFileToTypescript(filename);
  writeFileSync(outputFilename, code);
  console.log(`Written ${outputFilename}`);
}

function convertMarkdownFileToTypescript(filename: string): string {
  return getTypeScriptTemplate(filename);
}

function getTypeScriptTemplate(filename: string): string {
  const content = readFileSync(filename, { encoding: 'utf-8' });
  const escapedContent = content.replace(/\\/gim, '\\\\').replace(/\`/gim, '\\`');
  const templateString = `\`\n${escapedContent}\``;
  const veryObviousHintThatThisIsGenerated = `
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
// This file has been automatically generated from \`${filename}\`.
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
`.trim();
  return `
${veryObviousHintThatThisIsGenerated}
const AUTO_GENERATED_FROM_A_MARKDOWN_FILE =
${templateString};
${veryObviousHintThatThisIsGenerated}
export default AUTO_GENERATED_FROM_A_MARKDOWN_FILE;
${veryObviousHintThatThisIsGenerated}
  `.trim();
}
