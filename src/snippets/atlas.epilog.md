## INTEROPERABILITY BY PIPING JSON

Each command can format its output as JSON by adding `--output json` to it.
The resulting JSON can be used to chain commands.

### Example

Deploy a process model, start it, await its completion and show the resulting process instance and payload:

    $ pc deploy-files fixtures/Maintenance.ReverseString.bpmn --output json \
        | pc start-process-model --wait --output json \
        | pc show-process-instance
