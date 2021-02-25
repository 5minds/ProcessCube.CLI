## EXAMPLES

To finish a user task, provide its flow node instance id:

    $ atlas finish-user-task 23f4b54a-a7ef-462c-9afc-707fdd3592ec

Providing result values with --result:

    $ atlas finish-user-task  23f4b54a-a7ef-462c-9afc-707fdd3592ec --result '{"firstName": "Max", "lastName": "Mustermann"}'

Providing result values from a JSON file can be achieved with --result-from-file:

    $ atlas finish-user-task  23f4b54a-a7ef-462c-9afc-707fdd3592ec --result-from-file result.json

... or by simply piping a JSON file into the process.

    $ cat result.json | atlas finish-user-task 23f4b54a-a7ef-462c-9afc-707fdd3592ec

Please note that while Atlas CLI's output is strict JSON, it uses the more forgiving JSON5 for input, i.e. keys do not have to be double quoted, the file/data can contain JavaScript comments, etc.
