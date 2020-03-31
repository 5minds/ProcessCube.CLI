## EXAMPLES

To list all deployed process models on a connected engine, simply type:

    $ atlas list-process-models

Filtering by process model ID:

    $ atlas list-process-models --filter-by-id "Registration"

Rejecting by process model ID:

    $ atlas list-process-models --reject-by-id "Internal"

Filtering/rejecting also supports regular expressions:

    $ atlas list-process-models --filter-by-id "^Registration.+$"
