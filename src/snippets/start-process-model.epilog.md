## EXAMPLES

To start a process model, provide its model ID and start event ID:

    $ pc start-process-model Registration.EmailCoupons StartEvent_1

Alternatively, use the convenience alias `retry`:

    $ pc start Registration.EmailCoupons StartEvent_1

Setting a specific correlation ID with `--correlation-id`:

    $ pc start Registration.EmailCoupons StartEvent_1 --correlation-id "my-correlation-id-1234"

Waiting for the process to finish before exiting the CLI:

    $ pc start Registration.EmailCoupons StartEvent_1 --wait

Providing custom input values with `--input-values`:

    $ pc start Registration.EmailCoupons StartEvent_1 --input-values '{"answer": 42, "email": "jobs@5minds.de"}'

Providing custom input values from a JSON file can be achieved with `--input-values-from-file`:

    $ pc start Registration.EmailCoupons StartEvent_1 --input-values-from-file input.json

... or by using `` and simply piping a JSON file into the process.

    $ cat input.json | pc start Registration.EmailCoupons StartEvent_1

Please note that while ProcessCube CLI's output is strict JSON, it uses the more forgiving `JSON5` for input, i.e. keys do not have to be double quoted, the file/data can contain JavaScript comments, etc.
