//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
// This file has been automatically generated from `src/snippets/atlas.epilog.md`.
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
const AUTO_GENERATED_FROM_A_MARKDOWN_FILE =
`
## INTEROPERABILITY BY PIPING JSON

Each command can format its output as JSON by adding \`--output json\` to it.
The resulting JSON can be used to chain commands.

### Example

Deploy a process model, start it, await its completion and show the resulting process instance and payload:

    $ atlas deploy-files fixtures/Maintenance.ReverseString.bpmn --output json \\
        | atlas start-process-model --wait --output json \\
        | atlas show-process-instance
`;
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
// This file has been automatically generated from `src/snippets/atlas.epilog.md`.
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
export default AUTO_GENERATED_FROM_A_MARKDOWN_FILE;
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
// This file has been automatically generated from `src/snippets/atlas.epilog.md`.
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//