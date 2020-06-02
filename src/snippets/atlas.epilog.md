## INTEROPERABILITY BY PIPING JSON

Each command can format its output as JSON by adding `--output json` to it.
The resulting JSON can be used to chain commands.

### Example

Deploy a process model, start it, await its completion and show the resulting process instance and payload:

    $ atlas deploy-files fixtures/Maintenance.ReverseString.bpmn --output json \
        | atlas start-process-model --wait --output json \
        | atlas show-process-instance
