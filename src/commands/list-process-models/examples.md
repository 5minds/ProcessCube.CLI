## EXAMPLES

To list all deployed process models on a connected engine, simply type:

    $ pc list-process-models

Filtering by process model ID:

    $ pc list-process-models --filter-by-id "Registration"

Rejecting by process model ID:

    $ pc list-process-models --reject-by-id "Internal"

Filtering/rejecting also supports regular expressions:

    $ pc list-process-models --filter-by-id "^Registration.+$"
