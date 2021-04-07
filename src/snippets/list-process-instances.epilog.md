## EXAMPLES

To list all process instances of a connected engine, simply type:

    $ pc list-process-instances

Filtering by date:

    $ pc list-process-instances --created-after "2020-01-01" --created-before "2020-01-31"

Filtering by completed date:

    $ pc list-process-instances --completed-after "2020-01-01" --completed-before "2020-10-31"

Filtering by execution time in units of time 'days, hours, minutes or seconds' with the abbreviation 'd, h, m or s'.
For example, process-instances whose execution time is longer than 1 hour:

    $ pc list-process-instances --completed-in "> 1h"

For example, process-instances whose execution time is less than 45 minutes:

    $ pc list-process-instances --completed-in "< 45m"

Filtering by process model ID:

    $ pc list-process-instances --filter-by-process-model-id "Registration"

Filtering by state (error, running, finished):

    $ pc list-process-instances --filter-by-state error

Filtering by process model ID also supports regular expressions:

    $ pc list-process-instances --filter-by-process-model-id "^Registration.+$"

Filter options compound, meaning that they allow to look for more than one pattern:

    $ pc list-process-instances --filter-by-state error --filter-by-state finished

... i.e. using the same filter multiple times results in an OR query:

    $ pc list-process-instances --filter-by-process-model-id "Registration" --filter-by-process-model-id "Email"

... piping the result into another execution of list-process-instances leads to an AND query:

    $ pc list-process-instances --filter-by-process-model-id "Registration" --output json | pc list-process-instances --filter-by-process-model-id "Email"

Combinations of all switches are possible:

    $ pc list-process-instances --created-after "2020-01-01" --created-before "2020-01-31" \
                                    --completed-after "2020-01-01" --completed-before "2020-10-31" \
                                    --completed-in "> 1h" \
                                    --filter-by-process-model-id "^Registration.+$" \
                                    --reject-by-process-model-id "Internal" \
                                    --filter-by-state error \
                                    --filter-by-state finished \
                                    --sort-by-process-model-id asc \
                                    --sort-by-state desc \
                                    --sort-by-created-at asc

The above lists all process instances from January 2020, which were started from a process model whose name contains the prefix "Registration.", but does not contain the word "Internal", were completed between January and October 2020, took more than one hour to complete and which are finished or resulted in an error.
The results are sorted by process model in ascending alphabetical order, within each model section, the process instances are grouped by state in the order "running, error" and for each state, process instances are listed oldest to newest.
