## EXAMPLES

    $ atlas start-process-model Registration.EmailCoupons StartEvent_1

    $ atlas start Registration.EmailCoupons StartEvent_1

    $ atlas start Registration.EmailCoupons StartEvent_1 --correlation-id "my-correlation-id-1234"

    $ atlas start Registration.EmailCoupons StartEvent_1 --wait

    $ atlas start Registration.EmailCoupons StartEvent_1 --input-values '{"answer": 42, "email": "jobs@5minds.de"}'

    $ atlas start Registration.EmailCoupons StartEvent_1 --input-values-from-file input.json

    $ cat input.json | atlas start Registration.EmailCoupons StartEvent_1s
