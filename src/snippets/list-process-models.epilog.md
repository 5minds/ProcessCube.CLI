## EXAMPLES

    $ atlas list-process-models

    $ atlas list-process-models --filter-by-id "Registration"

    $ atlas list-process-models --reject-by-id "Internal"

Filtering/rejecting also supports regular expressions:

    $ atlas list-process-models --filter-by-id "^Registration.+$"
