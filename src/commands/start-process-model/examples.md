## EXAMPLES

To start a process model, provide its model ID and start event ID:

    $ pc start-process-model Registration.EmailCoupons StartEvent_1

Alternatively, use the convenience alias `start`:

    $ pc start Registration.EmailCoupons StartEvent_1

Setting a specific correlation ID with `--correlation-id`:

    $ pc start Registration.EmailCoupons StartEvent_1 --correlation-id "my-correlation-id-1234"

Waiting for the process to finish before exiting the CLI with `--wait`:

    $ pc start Registration.EmailCoupons StartEvent_1 --wait

Providing custom input values with `--start-token`:

    $ pc start Registration.EmailCoupons StartEvent_1 --start-token '{"answer": 42, "email": "jobs@5minds.de"}'

Providing custom input values from a JSON file can be achieved with `--start-token-from-file`:

    $ pc start Registration.EmailCoupons StartEvent_1 --start-token-from-file input.json

... or by using `--start-token-from-stdin` and simply piping a JSON file into the process.

    $ cat input.json | pc start Registration.EmailCoupons StartEvent_1 --start-token-from-stdin

Please note that while ProcessCube CLI's output is strict JSON, it uses the more forgiving `JSON5` for input, i.e. keys do not have to be double quoted, the file/data can contain JavaScript comments, etc.
