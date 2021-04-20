## EXAMPLES

To list all user tasks of a connected engine, simply type:

    $ pc list-user-tasks

Filtering by correlation ID:

    $ pc list-user-tasks --filter-by-correlation-id

Filtering by process model ID:

    $ pc list-user-tasks --filter-by-process-model-id "Registration"

Filtering by flow node instance ID:

    $ pc list-user-tasks --filter-by-flow-node-instance-id "db97e580-cbf6-4f54-b9bd-25fabdaf533c"

Filtering by state (error, running, finished):

    $ pc list-user-tasks --filter-by-state error

Filtering by process model ID also supports regular expressions:

    $ pc list-user-tasks --filter-by-process-model-id "^Registration.+$"

Filter options compound, meaning that they allow to look for more than one pattern:

    $ pc list-user-tasks --filter-by-state error --filter-by-state finished

... i.e. using the same filter multiple times results in an OR query:

    $ pc list-user-tasks --filter-by-process-model-id "Registration" --filter-by-process-model-id "Email"

... piping the result into another execution of list-user-tasks leads to an AND query:

    $ pc list-user-tasks --filter-by-process-model-id "Registration" | pc list-user-tasks --filter-by-process-model-id "Email"

Combinations of all switches are possible:

    $ pc list-user-tasks --filter-by-process-model-id "^Registration.+$" \\
                            --reject-by-process-model-id "Internal" \\
                            --filter-by-correlation-id "00b4a5cf-5e95-49c5-bf01-11a157a4f4e2" \\
                            --filter-by-state error \\
                            --filter-by-state finished \\
                            --sort-by-process-model-id asc \\
                            --sort-by-state desc

The above lists all user tasks, which were started from a process model whose name contains the prefix "Registration.", but does not contain the word "Internal", are part of the correlation "00b4a5cf-5e95-49c5-bf01-11a157a4f4e2" and are finished or resulted in an error.

The results are sorted by process model in ascending alphabetical order, within each model section, the user tasks are grouped by state in the order "running, error" and for each state.
