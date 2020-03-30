## EXAMPLES

To show information about a specific process instance, provide its ID:

    $ atlas show-process-instance 56a89c11-ee0d-4539-b4cb-84a0339262fd

The ID can be omitted to show the latest process instance that was started:

    $ atlas show-process-instance

Using the alias `show` comes in very handy here:

    $ atlas show

If you want to display all process instances for a given correlation ID in chronological order, use `--correlation`:

    $ atlas show-process-instance --correlation e552acfe-8446-42c0-a76b-5cd65bf110ac
