//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
// This file has been automatically generated from `src/snippets/list-process-instances.epilog.md`.
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
const AUTO_GENERATED_FROM_A_MARKDOWN_FILE =
`
## EXAMPLES

    $ atlas list-process-instances

Filtering by date:

    $ atlas list-process-instances --created-after "2020-01-01" --created-before "2020-01-31"

Filtering by process model ID:

    $ atlas list-process-instances --filter-by-process-model-id "Registration"

Filtering by state (error, running, finished):

    $ atlas list-process-instances --filter-by-state error

Filtering by process model ID also supports regular expressions:

    $ atlas list-process-instances --filter-by-process-model-id "^Registration.+$"

Filter options compound, meaning that they allow to look for more than one pattern:

    $ atlas list-process-instances --filter-by-state error --filter-by-state running

... i.e. using the same filter multiple times results in an OR query:

    $ atlas list-process-instances --filter-by-process-model-id "Registration" --filter-by-process-model-id "Email"

... piping the result into another execution of list-process-instances leads to an AND query:

    $ atlas list-process-instances --filter-by-process-model-id "Registration" --output json | atlas list-process-instances --filter-by-process-model-id "Email"

Combinations of all switches are possible:

    $ atlas list-process-instances --created-after "2020-01-01" --created-before "2020-01-31" \\
                                    --filter-by-process-model-id "^Registration.+$" \\
                                    --reject-by-process-model-id "Internal" \\
                                    --filter-by-state error \\
                                    --filter-by-state running \\
                                    --sort-by-process-model-id asc \\
                                    --sort-by-state desc \\
                                    --sort-by-created-at asc

The above lists all process instances from January 2020, which were started from a process model whose name contains the prefix "Registration.", but does not contain the word "Internal", and which are either still running or resulted in an error.
The results are sorted by process model in ascending alphabetical order, within each model section, the process instances are grouped by state in the order "running, error" and for each state, process instances are listed oldest to newest.
`;
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
// This file has been automatically generated from `src/snippets/list-process-instances.epilog.md`.
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
export default AUTO_GENERATED_FROM_A_MARKDOWN_FILE;
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//
// This file has been automatically generated from `src/snippets/list-process-instances.epilog.md`.
//
// AUTO-GENERATED - READ THIS - AUTO-GENERATED - READ THIS - AUTO-GENERATED
//