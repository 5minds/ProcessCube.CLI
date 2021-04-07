## INTEROPERABILITY BY PIPING JSON

Each command's output can be used to chain commands.

### Example

Deploy a process model, start it, await its completion and show the resulting process instance and payload:

    $ pc deploy-files fixtures/Maintenance.ReverseString.bpmn \
        | pc start-process-model --wait \
        | pc show-process-instance
