## EXAMPLES

To retry a process instance, simply provide its ID:

    $ atlas retry-process-instance 56a89c11-ee0d-4539-b4cb-84a0339262fd

Alternatively, use the convenience alias `retry`:

    $ atlas retry 56a89c11-ee0d-4539-b4cb-84a0339262fd

This command will restart that process instance at the task at which it failed, using the same input which caused it to fail the last time.
Retrying a process instance this way preserves the original process instance ID.
